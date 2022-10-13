export const inject = () => {
    Array.prototype.removeBy = function <T extends object, K extends keyof T>(this: T[], value: T[K], key: keyof T) {
        const index = this.findIndex((item) => {
            return item[key] === value;
        });

        if (index >= 0) {
            this.splice(index, 1);
        }

        return this;
    };
};
