/**
 * SingleTon
 */

class Logger {
    private static _instance: Logger | undefined; // here we will handle the uniqueness of the instance

    constructor(private logs: string[] = []) {
        if (!Logger._instance) {
            Logger._instance = this;
        }

        return Logger._instance;
    }

    register(msg?: string) {
        if (msg) this.logs.push(msg);
    }

    log<T>(...args: T[]) {
        // this.logs.push(msg);
        console.log(...args);
    }

    warn<T>(...args: T[]) {
        console.warn(...args);
    }

    error<T>(...args: T[]) {
        console.error(...args);
    }

    count<T extends string | undefined>(...args: T[]) {
        console.count(...args);
    }

    trace<T extends string | undefined>(...args: T[]) {
        console.trace(...args);
    }

    logs_count() {
        return this.logs.length;
    }
}

export default new Logger();
