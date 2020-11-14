class HttpError {
    constructor(error, statusCode) {
        this.error = error;
        this.statusCode = statusCode || 400;
    }

    log() {
        console.log('[HttpError]: ', this.error);
    }
}

module.exports = HttpError;
