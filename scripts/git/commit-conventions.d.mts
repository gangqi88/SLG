export declare const COMMIT_REGEX: RegExp;

export declare const validateCommitMessage: (message: string) => boolean;

export declare const getBranchName: () => string;

export declare const getStagedFiles: () => string[];

export type InferredType = 'feat' | 'fix' | 'refactor' | 'docs' | 'style' | 'test' | 'chore';

export declare const inferTypeFromFiles: (files: string[]) => InferredType | null;

export declare const scopeFromPath: (file: string) => string | null;

export declare const inferScopeFromFiles: (files: string[]) => string | null;

export declare const generateCommitTemplate: (args: { interactive?: boolean }) => Promise<string>;
