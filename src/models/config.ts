export interface Discovery {
    title: string,
    description: string;
    contact: string;
    default: string;
    api_roots: string[];
}

export interface Root {
    title: string;
    description: string;
    versions: string[];
    max_content_length: string;
    path: string;
}

export default interface Config {
    express_port: number;
    accepts: string[];
    mongo_host: string;
    mongo_port: string;
    response_type: {
        taxii: string;
        stix: string;
    }
    bundle_spec_version: string;
    discovery: Discovery;
    autogenerate_roots: {
        enabled: number;
        versions: string;
        max_content_length: string;
    },
    roots: Root[];
    connection_string?: string;
    ssl?: {
        keyPath: string;
        certPath: string;
        caPath: string;
    }
}
