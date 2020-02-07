import { ANTLRErrorListener, RecognitionException, Recognizer } from 'antlr4ts';

// tslint:disable-next-line: completed-docs
export class RegexErrorListener implements ANTLRErrorListener<any> {
    public static readonly Instance: RegexErrorListener = new RegexErrorListener();

    public syntaxError<T>(
        _recognizer: Recognizer<T, any>,// eslint-disable-line @typescript-eslint/no-unused-vars
        _offendingSymbol: T,// eslint-disable-line @typescript-eslint/no-unused-vars
        line: number,// eslint-disable-line @typescript-eslint/no-unused-vars
        charPositionInLine: number,// eslint-disable-line @typescript-eslint/no-unused-vars
        msg: string,// eslint-disable-line @typescript-eslint/no-unused-vars
        _e: RecognitionException | undefined): void {// eslint-disable-line @typescript-eslint/no-unused-vars
        
        throw Error(`Regular expression is invalid.`);
    }
}