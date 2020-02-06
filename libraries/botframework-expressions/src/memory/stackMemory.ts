import { MemoryInterface } from './memoryInterface';
import { Extensions } from '../extensions';

/**
 * @module botframework-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Stack implements of MemoryInterface.
 * Memory variables have a hierarchical relationship.
 */
export class StackedMemory implements MemoryInterface {

    private stack: MemoryInterface[] = [];

    public static wrap(memory: MemoryInterface): StackedMemory {
        if (memory instanceof StackedMemory) {
            return memory;
        } else {
            var stackedMemory = new StackedMemory();
            stackedMemory.push(memory);
            return stackedMemory;
        }
    }


    public push(memory: MemoryInterface): void {
        this.stack.push(memory);
    }

    public pop(): MemoryInterface {
        return this.stack.pop();
    }
    /**
     * Try get value from a given path.
     * @param path Given path.
     * @returns Resolved value.
     */
    public getValue(path: string): any {
        let result = undefined;

        if (this.stack.length === 0) {
            return result;
        }
        for (const memory of this.stack) {
            const currentResult = memory.getValue(path);
            if (currentResult !== undefined) {
                result = currentResult;
                break;
            }
        }

        return result;
    }

    /**
     * Set value to a given path.
     * In this simple object scope, we don't allow you to set a path in which some parts in middle don't exist
     * for example
     * if you set dialog.a.b = x, but dialog.a don't exist, this will result in an error
     * because we can't and shouldn't smart create structure in the middle
     * you can implement a customized Scope that support such behavior
     * @param path Memory path.
     * @param input Value to set.
     */
    public setValue(path: string, input: any): void {
        throw new Error(`Can't set value to ${ path }, stacked memory is read-only`);
    }

    public  version(): string {
        return '0';
    }
}