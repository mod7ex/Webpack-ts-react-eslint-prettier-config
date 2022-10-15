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

    log<T>(msg: T) {
        // this.logs.push(msg);
        console.log(msg);
    }

    warn<T>(msg: T) {
        console.warn(msg);
    }

    error<T>(msg: T) {
        console.error(msg);
    }

    count<T extends string | undefined>(msg?: T) {
        console.count(msg);
    }

    logs_count() {
        return this.logs.length;
    }
}

export default new Logger();
