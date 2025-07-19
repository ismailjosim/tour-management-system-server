/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
// createModule.js
const fs = require('fs');
const path = require('path');

// Get the module name from the command-line arguments
const moduleName = process.argv[2];

if (!moduleName) {
    console.error('Usage: node createModule.js <module-name>');
    process.exit(1);
}

const baseDir = path.join(__dirname, 'src', 'app', 'modules');
const moduleDir = path.join(baseDir, moduleName);

const filesToCreate = [
    `${ moduleName }.interface.ts`,
    `${ moduleName }.model.ts`,
    `${ moduleName }.constant.ts`,
    `${ moduleName }.controller.ts`,
    `${ moduleName }.service.ts`,
    `${ moduleName }.validation.ts`,
    `${ moduleName }.route.ts`,
];

// Basic boilerplate content for each file type
const getFileContent = (fileName) => {
    const nameWithoutExt = fileName.replace(/\.ts$/, '');
    const parts = nameWithoutExt.split('.');
    const type = parts[parts.length - 1]; // e.g., 'interface', 'model'
    const modulePrefix = parts[0]; // e.g., 'booking'
    const capitalizedModulePrefix = modulePrefix.charAt(0).toUpperCase() + modulePrefix.slice(1);

    switch (type) {
        case 'interface':
            return `export interface I${ capitalizedModulePrefix } {}`;
        case 'model':
            return `import { Schema, model } from 'mongoose';
import { I${ capitalizedModulePrefix } } from './${ modulePrefix }.interface';

const ${ modulePrefix }Schema = new Schema<I${ capitalizedModulePrefix }>({});

export const ${ capitalizedModulePrefix } = model<I${ capitalizedModulePrefix }>('${ capitalizedModulePrefix }', ${ modulePrefix }Schema);`;
        case 'constant':
            return `export const ${ modulePrefix.toUpperCase() }_STATUS = ['pending', 'confirmed', 'cancelled'] as const;
// Add other constants related to ${ modulePrefix } module here`;
        case 'controller':
            return `import { Request, Response, NextFunction } from 'express';
// import { ${ capitalizedModulePrefix }Service } from './${ modulePrefix }.service'; // Uncomment if needed

const create${ capitalizedModulePrefix } = (req: Request, res: Response, next: NextFunction) => {
  // Implement logic to create a new ${ modulePrefix }
  res.status(201).json({ message: '${ capitalizedModulePrefix } created successfully' });
};

// Add other controller methods here (e.g., get, update, delete)

export const ${ capitalizedModulePrefix }Controller = {
  create${ capitalizedModulePrefix },
  // ...
};`;
        case 'service':
            return `import { I${ capitalizedModulePrefix } } from './${ modulePrefix }.interface';
// import { ${ capitalizedModulePrefix } } from './${ modulePrefix }.model'; // Uncomment if needed

const create${ capitalizedModulePrefix } = async (payload: I${ capitalizedModulePrefix }): Promise<I${ capitalizedModulePrefix } | null> => {
  // Implement logic to interact with the database (e.g., save a new ${ modulePrefix })
  console.log('Creating ${ modulePrefix } with payload:', payload);
  // Example: const new${ capitalizedModulePrefix } = await ${ capitalizedModulePrefix }.create(payload);
  return null; // Replace with actual created document
};

// Add other service methods here (e.g., getAll, getById, update, delete)

export const ${ capitalizedModulePrefix }Service = {
  create${ capitalizedModulePrefix },
  // ...
};`;
        case 'validation':
            return `import { z } from 'zod'; // Assuming you use Zod for validation

const create${ capitalizedModulePrefix }ZodSchema = z.object({
  body: z.object({
    // Define your validation schema here
    // Example:
    // title: z.string({ required_error: 'Title is required' }),
    // description: z.string().optional(),
  }),
});

// Add other validation schemas here (e.g., update, get by ID)

export const ${ capitalizedModulePrefix }Validation = {
  create${ capitalizedModulePrefix }ZodSchema,
  // ...
};`;
        case 'route':
            return `import express from 'express';
import { ${ capitalizedModulePrefix }Controller } from './${ modulePrefix }.controller';
// import { ${ capitalizedModulePrefix }Validation } from './${ modulePrefix }.validation'; // Uncomment if needed
// import validateRequest from '../../middlewares/validateRequest'; // Assuming you have a validation middleware

const router = express.Router();

router.post(
  '/create-${ modulePrefix }',
  // validateRequest(${ capitalizedModulePrefix }Validation.create${ capitalizedModulePrefix }ZodSchema), // Uncomment and use your validation middleware
  ${ capitalizedModulePrefix }Controller.create${ capitalizedModulePrefix }
);

// Add other routes here (e.g., GET /, GET /:id, PATCH /:id, DELETE /:id)

export const ${ capitalizedModulePrefix }Routes = router;`;
        default:
            return `// ${ fileName } for ${ moduleName } module`;
    }
};

// Create the module directory
try {
    fs.mkdirSync(moduleDir, { recursive: true });
    console.log(`Directory created: ${ moduleDir }`);
} catch (err) {
    console.error(`Error creating directory ${ moduleDir }:`, err);
    process.exit(1);
}

// Create each file with boilerplate content
filesToCreate.forEach(fileName => {
    const filePath = path.join(moduleDir, fileName);
    const fileContent = getFileContent(fileName);

    try {
        fs.writeFileSync(filePath, fileContent.trim() + '\n');
        console.log(`File created: ${ filePath }`);
    } catch (err) {
        console.error(`Error creating file ${ filePath }:`, err);
    }
});

console.log(`\nModule '${ moduleName }' setup complete!`);
console.log(`Don't forget to integrate ${ moduleName }.route.ts into your main Express app.`);
