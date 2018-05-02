declare module "*.json" {
    const value: any;
    export default value;
}

declare module NodeJS {
    interface Global {
        unfetterconfigurations: any
    }
}
