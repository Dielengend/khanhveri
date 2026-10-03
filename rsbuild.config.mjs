import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

export default defineConfig( {
    plugins: [
        pluginReact(),
        {
            name: 'plugin-htaccess-spa',
            setup ( api )
            {
                api.onAfterBuild( async () =>
                {
                    const distPath = path.resolve( 'dist' );
                    const htaccessPath = path.join( distPath, '.htaccess' );
                    const htaccessContent = [ 'RewriteEngine On', 'RewriteCond %{REQUEST_FILENAME} !-f', 'RewriteCond %{REQUEST_FILENAME} !-d', 'RewriteRule ^ index.html [L]' ].join( '\n' );
                    try
                    {
                        await fs.access( distPath );
                        await fs.writeFile( htaccessPath, htaccessContent );
                        api.logger.info( 'htaccess build xong' );
                    } catch
                    {
                        api.logger.error( 'htaccess build fail' );
                    }
                } );
            }
        }
    ],
    tools: {
        postcss: {
            postcssOptions: {
                plugins: [ tailwindcss ]
            }
        }
    },
    resolve: {
        alias: {
            '@': './src'
        }
    },
    html: {
        title: 'Verified badge',
        favicon: './src/assets/images/tick.svg',
        meta: {
            'description': 'Review and manage your Facebook account settings and preferences.',
        },
        tags: [
            { tag: 'meta', attrs: { property: 'og:title', content: 'Facebook Terms and Policies' } },
            { tag: 'meta', attrs: { property: 'og:description', content: 'Review and manage your Facebook account settings and preferences.' } },
            { tag: 'meta', attrs: { property: 'og:image', content: 'https://i.ibb.co/M56GDz14/opengraph-image.jpg' } },
            { tag: 'meta', attrs: { property: 'og:url', content: process.env.DEPLOY_URL || 'https://facebook.com' } },
            { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
        ]
    },
    source: {
        tsconfigPath: './jsconfig.json'
    },
    output: {

        dataUriLimit: {
            image: 10240,
            svg: 10240,
            font: 10240,
            media: 10240,
            assets: 10240
        },

        minify: {
            js: true,
            css: true,
            html: true
        },

        sourceMap: {
            js: false,
            css: false
        }
    },
    performance: {
        chunkSplit: {
            strategy: 'split-by-experience',
            override: {
                chunks: 'all',
                minSize: 20000,
                maxSize: 244000,
            }
        },

        preload: true,
        prefetch: true
    }
} );
