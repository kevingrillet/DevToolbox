import { describe, expect, it } from 'vitest';
import { defaultConfig, runLint } from '../types';
import { pythonLinter } from './python';

const lint = (source: string) => runLint(pythonLinter, source, defaultConfig(pythonLinter));

describe('pythonLinter', () => {
  it('localise les tabulations, les espaces de fin et les except génériques', () => {
    const source = 'try:\r\n \tload()  \r\nexcept :  # fallback\r\n    pass';

    expect(lint(source)).toEqual([
      { ruleId: 'python-tab-indent', line: 2, column: 2, severity: 'warning' },
      { ruleId: 'python-trailing-whitespace', line: 2, column: 9, severity: 'warning' },
      { ruleId: 'python-bare-except', line: 3, column: 1, severity: 'warning' },
    ]);
  });

  it('compte les caractères Unicode et signale le premier caractère au-delà de 79', () => {
    const comment = (length: number) => `# ${'🌱'.repeat(length - 2)}`;

    expect(lint(`${comment(79)}\n${comment(80)}`)).toEqual([
      { ruleId: 'python-line-length', line: 2, column: 80, severity: 'info' },
    ]);
  });

  it('ignore les faux positifs dans les commentaires et les chaînes multilignes', () => {
    const source = [
      '\t# """ et except:',
      'doc = r"""',
      '\texcept:  ',
      '    \\"""',
      '"""',
      "name = 'escaped \\' quote # literal'",
      'msg = "continued \\',
      '\ttext"',
      'try:',
      '    load()',
      'except (ValueError, TypeError):',
      '    pass',
      '',
    ].join('\n');

    expect(lint(source)).toEqual([]);
  });

  it('reprend les contrôles après une chaîne fermée ou une chaîne simple incomplète', () => {
    const source = `doc = '''\n''' \nmsg = 'incomplète\n\tload()`;

    expect(lint(source)).toEqual([
      { ruleId: 'python-trailing-whitespace', line: 2, column: 4, severity: 'warning' },
      { ruleId: 'python-tab-indent', line: 4, column: 1, severity: 'warning' },
    ]);
  });
});

describe('pythonLinter.format', () => {
  const format = pythonLinter.format!;

  it('préserve les colonnes des blocs, les fins de ligne et les expressions interpolées simples', () => {
    const source = 'if ok:\r\n \tif ready: \r\n \t\tprint(f"{{{name!r}}}")\t\r\n \tdone()';
    const expected =
      'if ok:\r\n        if ready:\r\n                print(f"{{{name!r}}}")\r\n        done()';

    expect(format(source)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });

  it('préserve les blancs à l’intérieur des chaînes multilignes', () => {
    const source = [
      'def f():',
      '\tdoc = r"""  ',
      '\t  ligne  ',
      '\t"""  ',
      '\tmsg = "continued \\',
      '\ttext"  ',
      '\treturn doc, msg  ',
      '',
    ].join('\n');
    const expected = [
      'def f():',
      '        doc = r"""  ',
      '\t  ligne  ',
      '\t"""',
      '        msg = "continued \\',
      '\ttext"',
      '        return doc, msg',
      '',
    ].join('\n');

    expect(format(source)).toBe(expected);
  });

  it('préserve les blancs après un antislash', () => {
    const source = 'x = 1 + \\  \r\n2  ';

    expect(format(source)).toBe('x = 1 + \\  \r\n2');
  });

  it('préserve toute la source quand un saut de page intervient dans l’indentation', () => {
    const source = 'if ok:  \n\f\tstart()  \n\tfinish()';

    expect(format(source)).toBe(source);
  });

  it.each([
    'value = "string',
    'value = """unclosed\n\ttext  ',
    'value = f"{\n    name\n}"',
    'value = f"{row["key"]}"',
    'value = t"""{name}"""',
  ])('préserve la source quand la chaîne est incomplète ou ambiguë (%s)', (literal) => {
    const source = `x = 1  \n${literal}\n`;

    expect(format(source)).toBe(source);
  });
});
