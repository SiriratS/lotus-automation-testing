import * as http from 'http';
import httpProxy from 'http-proxy';

/**
 * Standalone Proxy Server for API Mocking and Request Logging
 * 
 * This utility creates a proxy server that can:
 * - Intercept and log all HTTP requests
 * - Mock specific API endpoints
 * - Modify requests and responses on the fly
 * - Simulate network conditions (delays, errors)
 */

interface ProxyConfig {
    port: number;
    targetHost: string;
    mockEndpoints?: Map<string, any>;
    logRequests?: boolean;
    delayMs?: number;
}

export class ProxyServer {
    private server: http.Server | null = null;
    private proxy: httpProxy | null = null;
    private config: ProxyConfig;
    private requestLog: Array<{
        method: string;
        url: string;
        headers: http.IncomingHttpHeaders;
        timestamp: Date;
    }> = [];

    constructor(config: Partial<ProxyConfig> = {}) {
        this.config = {
            port: config.port || 8888,
            targetHost: config.targetHost || 'https://api-o2o.lotuss.com',
            mockEndpoints: config.mockEndpoints || new Map(),
            logRequests: config.logRequests !== false,
            delayMs: config.delayMs || 0,
        };
    }

    /**
     * Add a mock endpoint
     */
    addMockEndpoint(urlPattern: string, mockResponse: any) {
        this.config.mockEndpoints?.set(urlPattern, mockResponse);
    }

    /**
     * Start the proxy server
     */
    async start(): Promise<void> {
        this.proxy = httpProxy.createProxyServer({
            secure: false,
            changeOrigin: true,
        });

        // Handle proxy errors
        this.proxy.on('error', (err, req, res) => {
            console.error('[PROXY ERROR]', err.message);
            if (res instanceof http.ServerResponse) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
            }
        });

        this.server = http.createServer(async (req, res) => {
            const fullUrl = req.url || '';
            const method = req.method || 'GET';

            // Log request
            if (this.config.logRequests) {
                this.requestLog.push({
                    method,
                    url: fullUrl,
                    headers: req.headers,
                    timestamp: new Date(),
                });
                console.log(`[PROXY] ${method} ${fullUrl}`);
            }

            // Simulate delay if configured
            if (this.config.delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, this.config.delayMs));
            }

            // Check if this URL should be mocked
            const mockEndpoint = Array.from(this.config.mockEndpoints?.entries() || [])
                .find(([pattern]) => fullUrl.includes(pattern));

            if (mockEndpoint) {
                const [pattern, mockResponse] = mockEndpoint;
                console.log(`[PROXY] Mocking endpoint: ${pattern}`);

                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                });

                res.end(JSON.stringify(mockResponse));
                return;
            }

            // Handle CORS preflight
            if (method === 'OPTIONS') {
                res.writeHead(200, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                });
                res.end();
                return;
            }

            // Proxy to actual server
            const target = fullUrl.startsWith('http') ? fullUrl : `${this.config.targetHost}${fullUrl}`;

            if (this.proxy) {
                this.proxy.web(req, res, {
                    target,
                    changeOrigin: true,
                    secure: false,
                });
            }
        });

        return new Promise<void>((resolve) => {
            this.server?.listen(this.config.port, () => {
                console.log(`[PROXY] Server started on http://localhost:${this.config.port}`);
                console.log(`[PROXY] Proxying to: ${this.config.targetHost}`);
                resolve();
            });
        });
    }

    /**
     * Stop the proxy server
     */
    async stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log('[PROXY] Server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Get request log
     */
    getRequestLog() {
        return this.requestLog;
    }

    /**
     * Clear request log
     */
    clearRequestLog() {
        this.requestLog = [];
    }

    /**
     * Print request log summary
     */
    printRequestLog() {
        console.log('\n=== Proxy Request Log ===');
        console.log(`Total requests: ${this.requestLog.length}\n`);

        this.requestLog.forEach((log, index) => {
            console.log(`${index + 1}. [${log.timestamp.toISOString()}]`);
            console.log(`   ${log.method} ${log.url}`);
            console.log(`   User-Agent: ${log.headers['user-agent'] || 'N/A'}`);
            console.log('');
        });

        console.log('=========================\n');
    }
}

/**
 * Run this file directly to start a standalone proxy server
 * Usage: ts-node utils/proxy-server.ts
 */
if (require.main === module) {
    const proxyServer = new ProxyServer({
        port: 8888,
        logRequests: true,
    });

    // Add mock endpoint for product API
    proxyServer.addMockEndpoint('/lotuss-mobile-bff/product/v4/product', {
        data: {
            id: '72072326',
            slug: 'cpf-72072326',
            name: 'ซีพี คุโรบูตะ สเต็กหมูหมักพริกไทยดำ 200 กรัม',
            price: { current: 89.00, currency: 'THB' },
            stock: { available: true },
        },
        status: 'success',
    });

    proxyServer.start().then(() => {
        console.log('\nProxy server is running!');
        console.log('Configure your browser/Playwright to use proxy: http://localhost:8888');
        console.log('Press Ctrl+C to stop\n');
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\nShutting down proxy server...');
        await proxyServer.stop();
        process.exit(0);
    });
}
