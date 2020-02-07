/**
 * @module botframework-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Constant } from './constant';
import { Expression, ReturnType } from './expression';
import { ExpressionType } from './expressionType';

/**
 * Some util and extension functions
 */
export class Extensions {

    /**
     * Return the static reference paths to memory.
     * Return all static paths to memory.  If there is a computed element index, then the path is terminated there,
     * but you might get other paths from the computed part as well.
     * @param expression Expression to get references from.
     * @returns List of the static reference paths.
     */
    public static references(expression: Expression): string[] {
        let path: string;
        let references: Set<string>;
        ({path, references} = this.referenceWalk(expression));
        if (path !== undefined) {
            references = references.add(path);
        }

        return Array.from(references);
    }

    /**
     * Patch method
     * TODO: is there any better solution?
     * To judge if an object is implements MemoryInterface. Same with 'is MemoryInterface' in C#
     */
    public static isMemoryInterface(obj: any): boolean {
        if (obj === undefined) {
            return false;
        }

        if (typeof obj !== 'object') {
            return false;
        }
        
        return 'getValue' in obj && 'setValue' in obj && 'version' in obj 
                && typeof obj.getValue === 'function' && typeof obj.setValue === 'function' && typeof obj.version === 'function';
    }

    /**
     * Walking function for identifying static memory references in an expression.
     * @param expression Expression to analyze.
     * @param extension If present, called to override lookup for things like template expansion.
     * @returns Accessor path of expression which is a potential partial path and the full path found so far.
     */
    public static referenceWalk(expression: Expression, extension?: (arg0: Expression) => boolean): {path: string; references: Set<string> } {
        let path: string;
        let references: Set<string>;
        if (extension === undefined || !extension(expression)) {
            const children: Expression[] = expression.children;
            if (expression.type === ExpressionType.Accessor) {
                const prop: string = (children[0] as Constant).value as string;

                if (children.length === 1) {
                    path = prop;
                }

                if (children.length === 2) {
                    ({path, references} = Extensions.referenceWalk(children[1], extension));
                    if (path !== undefined) {
                        path = path.concat('.', prop);
                    }
                    // if path is null we still keep it null, won't append prop
                    // because for example, first(items).x should not return x as refs
                }
            } else if (expression.type === ExpressionType.Element) {
                ({path, references} = Extensions.referenceWalk(children[0], extension));
                if (path !== undefined) {
                    if (children[1] instanceof Constant) {
                        const cnst: Constant = children[1] as Constant;
                        if (cnst.returnType === ReturnType.String) {
                            path += `.${ cnst.value }`;
                        } else {
                            path += `[${ cnst.value }]`;
                        }
                    } else {
                        references.add(path);
                    }
                }
                let idxPath: string;
                let refs1: Set<string>;
                ({path: idxPath, references: refs1} = Extensions.referenceWalk(children[1], extension));
                refs1.forEach(u => references.add(u));

                if (idxPath !== undefined) {
                    references.add(idxPath);
                }
            } else {
                for (const child of expression.children) {
                    const childPath: string = Extensions.referenceWalk(child, references, extension);
                    if (childPath !== undefined) {
                        references.add(childPath);
                    }
                }
            }
        }

        return path;
    }

    /**
     * Lookup a property in IDictionary, JObject or through reflection.
     * @param instance Instance with property.
     * @param property Property to lookup.
     * @returns Value and error information if any.
     */
    public static accessProperty(instance: any, property: string): { value: any; error: string } {
        // NOTE: This returns null rather than an error if property is not present
        if (!instance) {
            return { value: undefined, error: undefined };
        }

        let value: any;
        // tslint:disable-next-line: prefer-const
        let error: string;
        // todo, Is there a better way to access value, or any case is not listed below?
        if (instance instanceof Map && instance as Map<string, any>!== undefined) {
            const instanceMap: Map<string, any> = instance as Map<string, any>;
            value = instanceMap.get(property);
            if (value === undefined) {
                const prop: string = Array.from(instanceMap.keys()).find((k: string): boolean => k.toLowerCase() === property.toLowerCase());
                if (prop !== undefined) {
                    value = instanceMap.get(prop);
                }
            }
        } else {
            const prop: string = Object.keys(instance).find((k: string): boolean => k.toLowerCase() === property.toLowerCase());
            if (prop !== undefined) {
                value = instance[prop];
            }
        }

        return { value, error };
    }

    /**
     * Set a property in Map or Object.
     * @param instance Instance to set.
     * @param property Property to set.
     * @param value Value to set.
     * @returns set value.
     */
    public static setProperty(instance: any, property: string, value: any): { value: any; error: string } {
        const result: any = value;
        if (instance instanceof Map) {
            instance.set(property, value);
        } else {
            instance[property] = value;
        }

        return {value: result, error: undefined};
    }

    /**
     * Lookup a property in IDictionary, JObject or through reflection.
     * @param instance Instance with property.
     * @param property Property to lookup.
     * @returns Value and error information if any.
     */
    public static accessIndex(instance: any, index: number): { value: any; error: string } {
        // NOTE: This returns null rather than an error if property is not present
        if (instance === null || instance === undefined) {
            return { value: undefined, error: undefined };
        }

        let value: any;
        let error: string;

        let count = -1;
        if (Array.isArray(instance)) {
            count = instance.length;
        } else if (instance instanceof Map) {
            count = (instance as Map<string, any>).size;
        }
        const indexer: string[] = Object.keys(instance);
        if (count !== -1 && indexer.length > 0) {
            if (index >= 0 && count > index) {
                const idyn: any = instance;
                value = idyn[index];
            } else {
                error = `${ index } is out of range for ${ instance }`;
            }
        } else {
            error = `${ instance } is not a collection.`;
        }

        return { value, error };
    }
}
