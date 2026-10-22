import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
export default {output:'standalone',poweredByHeader:false,turbopack:{root},outputFileTracingRoot:root};
