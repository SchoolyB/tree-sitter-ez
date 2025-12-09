module.exports = grammar({
  name: 'ez',

  extras: $ => [
    /\s/,
    $.comment,
    $.block_comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$.variable_declaration],
    [$.struct_literal, $._primary_expression],
    [$.call_expression, $._primary_expression],
    [$.array_literal, $.map_literal],
  ],

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.import_statement,
      $.using_statement,
      $.variable_declaration,
      $.function_declaration,
      $.struct_declaration,
      $.enum_declaration,
      $.if_statement,
      $.for_statement,
      $.as_long_as_statement,
      $.loop_statement,
      $.return_statement,
      $.break_statement,
      $.continue_statement,
      $.assignment_statement,
      $.expression_statement,
    ),

    // Import statements
    import_statement: $ => seq(
      'import',
      choice(
        seq('&', 'use'),
        seq(),
      ),
      $._import_list,
    ),

    _import_list: $ => seq(
      $.import_path,
      repeat(seq(',', $.import_path)),
    ),

    import_path: $ => choice(
      seq('@', $.identifier),
      $.string,
    ),

    using_statement: $ => seq(
      'using',
      $.identifier,
      repeat(seq(',', $.identifier)),
    ),

    // Variable declaration
    variable_declaration: $ => prec.right(seq(
      choice('temp', 'const'),
      $.identifier,
      optional($.type),
      optional(seq('=', $._expression)),
    )),

    // Function declaration
    function_declaration: $ => seq(
      'do',
      field('name', $.identifier),
      '(',
      optional($.parameter_list),
      ')',
      optional(seq('->', $.return_types)),
      $.block,
    ),

    parameter_list: $ => seq(
      $.parameter,
      repeat(seq(',', $.parameter)),
    ),

    parameter: $ => seq(
      optional('&'),
      field('name', $.identifier),
      field('type', $.type),
    ),

    return_types: $ => choice(
      $.type,
      seq('(', $.type, repeat(seq(',', $.type)), ')'),
    ),

    // Struct declaration
    struct_declaration: $ => seq(
      'const',
      field('name', $.identifier),
      'struct',
      '{',
      repeat($.field_declaration),
      '}',
    ),

    field_declaration: $ => seq(
      field('names', seq($.identifier, repeat(seq(',', $.identifier)))),
      field('type', $.type),
    ),

    // Enum declaration
    enum_declaration: $ => seq(
      optional($.attribute),
      'const',
      field('name', $.identifier),
      'enum',
      '{',
      repeat($.enum_value),
      '}',
    ),

    enum_value: $ => seq(
      $.identifier,
      optional(seq('=', $._expression)),
    ),

    attribute: $ => seq(
      '@',
      '(',
      $.identifier,
      repeat(seq(',', $._expression)),
      ')',
    ),

    // Control flow
    if_statement: $ => seq(
      'if',
      $._expression,
      $.block,
      repeat($.or_clause),
      optional($.otherwise_clause),
    ),

    or_clause: $ => seq(
      'or',
      $._expression,
      $.block,
    ),

    otherwise_clause: $ => seq(
      'otherwise',
      $.block,
    ),

    for_statement: $ => seq(
      choice('for', 'for_each'),
      optional('('),
      $.identifier,
      optional($.type),
      'in',
      $._expression,
      optional(')'),
      $.block,
    ),

    as_long_as_statement: $ => seq(
      'as_long_as',
      $._expression,
      $.block,
    ),

    loop_statement: $ => seq(
      'loop',
      $.block,
    ),

    return_statement: $ => prec.right(seq(
      'return',
      optional($._expression_list),
    )),

    _expression_list: $ => seq(
      $._expression,
      repeat(seq(',', $._expression)),
    ),

    break_statement: $ => 'break',

    continue_statement: $ => 'continue',

    // Assignment
    assignment_statement: $ => prec.right(seq(
      $._expression,
      choice('=', '+=', '-=', '*=', '/=', '%='),
      $._expression,
    )),

    expression_statement: $ => $._expression,

    block: $ => seq(
      '{',
      repeat($._statement),
      '}',
    ),

    // Expressions
    _expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $._primary_expression,
    ),

    _primary_expression: $ => choice(
      $.identifier,
      $.number,
      $.string,
      $.char_literal,
      $.true,
      $.false,
      $.nil,
      $.array_literal,
      $.map_literal,
      $.struct_literal,
      $.call_expression,
      $.member_expression,
      $.index_expression,
      $.grouped_expression,
      $.new_expression,
      $.range_expression,
    ),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    number: $ => choice(
      /[0-9][0-9_]*\.[0-9][0-9_]*/,  // float
      /0x[0-9a-fA-F_]+/,              // hex
      /0b[01_]+/,                     // binary
      /0o[0-7_]+/,                    // octal
      /[0-9][0-9_]*/,                 // integer
    ),

    string: $ => seq(
      '"',
      repeat(choice(
        /[^"\\$]+/,
        $.escape_sequence,
        $.interpolation,
      )),
      '"',
    ),

    escape_sequence: $ => /\\[nrt\\'"0]/,

    interpolation: $ => seq(
      '${',
      $._expression,
      '}',
    ),

    char_literal: $ => seq(
      "'",
      choice(/[^'\\]/, $.escape_sequence),
      "'",
    ),

    true: $ => 'true',
    false: $ => 'false',
    nil: $ => 'nil',

    array_literal: $ => seq(
      '{',
      optional($._expression_list),
      '}',
    ),

    map_literal: $ => seq(
      '{',
      optional(seq($.map_entry, repeat(seq(',', $.map_entry)))),
      '}',
    ),

    map_entry: $ => seq(
      $._expression,
      ':',
      $._expression,
    ),

    struct_literal: $ => prec.dynamic(1, seq(
      $.identifier,
      '{',
      optional(seq($.struct_field, repeat(seq(',', $.struct_field)))),
      '}',
    )),

    struct_field: $ => seq(
      $.identifier,
      ':',
      $._expression,
    ),

    call_expression: $ => prec.left(8, seq(
      $._primary_expression,
      '(',
      optional($._expression_list),
      ')',
    )),

    member_expression: $ => prec.left(9, seq(
      $._primary_expression,
      '.',
      field('property', $.identifier),
    )),

    index_expression: $ => prec.left(9, seq(
      $._primary_expression,
      '[',
      $._expression,
      ']',
    )),

    unary_expression: $ => prec.right(7, seq(
      choice('-', '!'),
      $._expression,
    )),

    binary_expression: $ => choice(
      prec.left(1, seq($._expression, '||', $._expression)),
      prec.left(2, seq($._expression, '&&', $._expression)),
      prec.left(3, seq($._expression, choice('==', '!=', '<', '>', '<=', '>='), $._expression)),
      prec.left(3, seq($._expression, choice('in', 'not_in'), $._expression)),
      prec.left(4, seq($._expression, choice('+', '-'), $._expression)),
      prec.left(5, seq($._expression, choice('*', '/', '%'), $._expression)),
    ),

    grouped_expression: $ => seq('(', $._expression, ')'),

    new_expression: $ => prec.right(10, seq(
      'new',
      $.identifier,
      optional(seq('{', optional(seq($.struct_field, repeat(seq(',', $.struct_field)))), '}')),
    )),

    range_expression: $ => seq(
      'range',
      '(',
      $._expression,
      optional(seq(',', $._expression)),
      optional(seq(',', $._expression)),
      ')',
    ),

    // Types
    type: $ => choice(
      $.primitive_type,
      $.array_type,
      $.map_type,
      $.identifier,
    ),

    primitive_type: $ => choice(
      'int', 'i8', 'i16', 'i32', 'i64', 'i128', 'i256',
      'u8', 'u16', 'u32', 'u64', 'u128', 'u256',
      'float', 'f32', 'f64',
      'bool', 'char', 'byte', 'string',
    ),

    array_type: $ => seq(
      '[',
      $.type,
      optional(seq(',', $.number)),
      ']',
    ),

    map_type: $ => seq(
      'map',
      '[',
      $.type,
      ':',
      $.type,
      ']',
    ),

    // Comments
    comment: $ => /\/\/[^\n]*/,

    block_comment: $ => /\/\*[^*]*\*+([^/*][^*]*\*+)*\//,
  },
});
