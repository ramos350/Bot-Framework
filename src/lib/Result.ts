export default class Result {
    readonly ok: boolean;

    private constructor(ok: boolean) {
        this.ok = ok;
    }

    static ok(): Result {
        return new Result(true);
    }

    static none(): Result {
        return new Result(false);
    }
}
