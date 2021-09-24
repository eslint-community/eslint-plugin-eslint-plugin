/**
 * @fileoverview require fixer functions to return a fix
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/fixer-return');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('fixer-return', rule, {
  valid: [
    `
    module.exports = {
        create: function(context) {
            context.report( {
                fix: function(fixer) {
                    return fixer.foo();
                }
            });
        }
    };
    `,
    `
    module.exports = {
        create: function(context) {
            context.report( {
                fix: function(fixer) {
                    return [
                        fixer.foo(),
                        fixer.bar()
                    ];
                }
            });
        }
    };
    `,
    // Not the right fix function.
    `
    module.exports = {
        create: function(context) {
            context.report( {
                notFix: function(fixer) {
                }
            });
        }
    };
    `,
    // Not the right fix function (arrow function with implied return)
    `
    module.exports = {
        create: function(context) {
            context.report( {
                notFix: fixer => undefined
            });
        }
    };
    `,
    // Not the right fix function (arrow function)
    `
    module.exports = {
        create: function(context) {
            context.report( {
                notFix: fixer => {}
            });
        }
    };
    `,
    // Arrow function (expression)
    `
    module.exports = {
        create: function(context) {
            context.report({
                fix: fixer => fixer.foo()
            });
        }
    };
    `,
    // Arrow function (with return)
    `
    module.exports = {
        create: function(context) {
            context.report({
                fix: fixer => {return fixer.foo();}
            });
        }
    };
    `,
    // Generator
    `
    module.exports = {
        create: function (context) {
            context.report({
                fix: function* (fixer) {
                    yield fixer.foo();
                }
            });
        }
    };
    `,
    // Yielded a fix object, but with one code branch that has no autofix.
    `
    module.exports = {
        create: function (context) {
            context.report({
                fix: function* (fixer) {
                    if (foo) {
                        return; // no autofix in this case
                    }
                    yield fixer.foo();
                }
            });
        }
    };
    `,
    // Return fix in variable.
    `
    module.exports = {
        create: function(context) {
            context.report( {
                fix: function(fixer) {
                    const fix = fixer.foo();
                    return fix;
                }
            });
        }
    };
    `,
    // Return array variable.
    `
    module.exports = {
        create: function(context) {
            context.report( {
                fix: function(fixer) {
                    const fixers = [];
                    // ... fixers could be added to this array here
                    return fixers;
                }
            });
        }
    };
    `,
    // Return fix in array.
    `
    module.exports = {
        create: function(context) {
            context.report( {
                fix: function(fixer) {
                    return [fixer.foo()];
                }
            });
        }
    };
    `,
    // With one code branch that has no autofix (return null).
    `
    module.exports = {
        create: function(context) {
            context.report( {
                fix: function(fixer) {
                    if (foo) {
                        return null; // no autofix in this case
                    }
                    return fixer.foo();
                }
            });
        }
    };
    `,
    // With one code branch that has no autofix (return undefined).
    `
    module.exports = {
        create: function(context) {
            context.report( {
                fix: function(fixer) {
                    if (foo) {
                        return undefined; // no autofix in this case
                    }
                    return fixer.foo();
                }
            });
        }
    };
    `,
    // With one code branch that has no autofix (return empty array).
    `
    module.exports = {
        create: function(context) {
            context.report( {
                fix: function(fixer) {
                    if (foo) {
                        return []; // no autofix in this case
                    }
                    return fixer.foo();
                }
            });
        }
    };
    `,
    // With one code branch that has no autofix (return implicit undefined).
    `
    module.exports = {
        create: function(context) {
            context.report( {
                fix: function(fixer) {
                    if (foo) {
                        return; // no autofix in this case
                    }
                    return fixer.foo();
                }
            });
        }
    };
    `,
  ],

  invalid: [
    {
      // Fix but missing return
      code: `
        module.exports = {
            create: function(context) {
                context.report({
                    fix(fixer) {
                        fixer.foo();
                    }
                });
            }
        };
        `,
      errors: [{ messageId: 'missingFix', type: 'FunctionExpression', line: 5, column: 24 }],
    },
    {
      // Fix but missing return (arrow function, report on arrow)
      code: `
        module.exports = {
            create: function(context) {
                context.report({
                    fix: (fixer) => {
                        fixer.foo();
                    }
                });
            }
        };
        `,
      errors: [{ messageId: 'missingFix', type: 'ArrowFunctionExpression', line: 5, endLine: 5, column: 34, endColumn: 36 }],
    },
    {
      // With no autofix (arrow function, explicit return, report on arrow)
      code: `
        module.exports = {
            create: function(context) {
                context.report({
                    fix: (fixer) => {
                        return undefined;
                    }
                });
            }
        };
        `,
      errors: [{ messageId: 'missingFix', type: 'ArrowFunctionExpression', line: 5, endLine: 5, column: 34, endColumn: 36 }],
    },
    {
      // With no autofix (arrow function, implied return, report on arrow)
      code: `
        module.exports = {
            create: function(context) {
                context.report( {
                    fix: fixer => undefined
                });
            }
        };
        `,
      errors: [{ messageId: 'missingFix', type: 'ArrowFunctionExpression', line: 5, endLine: 5, column: 32, endColumn: 34 }],
    },
    {
      // Fix but missing yield (generator)
      code: `
        module.exports = {
            create: function(context) {
                context.report({
                    *fix(fixer) {
                        fixer.foo();
                    }
                });
            }
        };
        `,
      errors: [{ messageId: 'missingFix', type: 'FunctionExpression', line: 5, column: 25 }],
    },
    {
      // With no autofix (only yield undefined)
      code: `
        module.exports = {
            create: function(context) {
                context.report({
                    *fix(fixer) {
                        yield undefined;
                    }
                });
            }
        };
        `,
      errors: [{ messageId: 'missingFix', type: 'FunctionExpression', line: 5, column: 25 }],
    },
    {
      // With no autofix (only return null)
      code: `
        module.exports = {
            create: function(context) {
                context.report( {
                    fix: function(fixer) {
                        return null;
                    }
                });
            }
        };
        `,
      errors: [{ messageId: 'missingFix', type: 'FunctionExpression', line: 5, column: 26 }],
    },
    {
      // With no autofix (only return undefined)
      code: `
        module.exports = {
            create: function(context) {
                context.report( {
                    fix: function(fixer) {
                        return undefined;
                    }
                });
            }
        };
        `,
      errors: [{ messageId: 'missingFix', type: 'FunctionExpression', line: 5, column: 26 }],
    },
    {
      // With no autofix (only return undefined, but in variable)
      code: `
        module.exports = {
            create: function(context) {
                context.report( {
                    fix: function(fixer) {
                        const returnValue = undefined;
                        return returnValue;
                    }
                });
            }
        };
        `,
      errors: [{ messageId: 'missingFix', type: 'FunctionExpression', line: 5, column: 26 }],
    },
    {
      // With no autofix (only return implicit undefined)
      code: `
        module.exports = {
            create: function(context) {
                context.report( {
                    fix: function(fixer) {
                        return;
                    }
                });
            }
        };
        `,
      errors: [{ messageId: 'missingFix', type: 'FunctionExpression', line: 5, column: 26 }],
    },
    {
      // With no autofix (only return empty array)
      code: `
        module.exports = {
            create: function(context) {
                context.report( {
                    fix: function(fixer) {
                        return [];
                    }
                });
            }
        };
        `,
      errors: [{ messageId: 'missingFix', type: 'FunctionExpression', line: 5, column: 26 }],
    },
    {
      // With no autofix (no return, empty function)
      code: `
        module.exports = {
            create: function(context) {
                context.report( {
                    fix: function(fixer) {
                    }
                });
            }
        };
        `,
      errors: [{ messageId: 'missingFix', type: 'FunctionExpression', line: 5, column: 26 }],
    },
  ],
});
