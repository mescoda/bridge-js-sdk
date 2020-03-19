
import pkg from './package.json';

import babel from 'rollup-plugin-babel';

const external = (id) => {
    return !id.startsWith('.') && !id.startsWith('/');
};

export default [
    {
        input: 'src/index.js',
        output: [
            {
                file: pkg.main,
                format: 'cjs'
            },
            {
                file: pkg.module,
                format: 'esm'
            }
        ],
        external,
        plugins: [
            babel({
                exclude: '/node_modules/',
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: {
                                ie: 11
                            },

                            // disable BrowserslistConfig
                            ignoreBrowserslistConfig: true,

                            // Do not transform modules to CJS
                            modules: false
                        }
                    ]
                ],
                plugins: [
                    '@babel/plugin-proposal-object-rest-spread',
                    '@babel/plugin-proposal-class-properties'
                ]
            })
        ]
    }
];
