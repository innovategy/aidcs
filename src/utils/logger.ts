// src/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';


class Logger {
    private getTimestamp(): string {
        return new Date().toISOString();
    }

    private formatMessage(level: LogLevel, module: string, message: string): string {
        return `[${this.getTimestamp()}] [${level.toUpperCase()}] [${module}] ${message}`;
    }

    debug(module: string, message: string, data?: any) {
        const formattedMessage = this.formatMessage('debug', module, message);
        console.debug(formattedMessage, data || '');
    }

    info(module: string, message: string, data?: any) {
        const formattedMessage = this.formatMessage('info', module, message);
        console.info(formattedMessage, data || '');
    }

    warn(module: string, message: string, data?: any) {
        const formattedMessage = this.formatMessage('warn', module, message);
        console.warn(formattedMessage, data || '');
    }

    error(module: string, message: string, data?: any) {
        const formattedMessage = this.formatMessage('error', module, message);
        console.error(formattedMessage, data || '');
    }
}

export const logger = new Logger();
