export default class Result {
    readonly ok: boolean;
    readonly reason?: string

    private constructor(ok: boolean, reason?: string) {
        this.ok = ok;
        this.reason = reason
    }

    static ok(): Result {
        return new Result(true);
    }

    static none(): Result {
        return new Result(false);
    }

    static reason(reason: string): Result {
        return new Result(false, reason)
    }
}
