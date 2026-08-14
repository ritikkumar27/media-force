import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        // Route API requests to your NestJS backend
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        // Route WebSocket connections to your NestJS backend
        '/socket.io': {
          target: 'http://localhost:3000',
          ws: true,
          changeOrigin: true,
        }
      }
    }
  }
});


// import { defineConfig } from 'astro/config';
// import tailwindcss from '@tailwindcss/vite';
// import node from '@astrojs/node';

// export default defineConfig({
//   output: 'server',
//   adapter: node({
//     mode: 'standalone'
//   }),
//   vite: {
//     plugins: [tailwindcss()]
//   }
// });




// //------------------------------------------------------
// // // @ts-check
// // import { defineConfig } from 'astro/config';

// // import tailwindcss from '@tailwindcss/vite';

// // import node from '@astrojs/node';

// // // https://astro.build/config
// // export default defineConfig({
// //   vite: {
// //     plugins: [tailwindcss()]
// //   },

// //   adapter: node({
// //     mode: 'standalone'
// //   })
// // });