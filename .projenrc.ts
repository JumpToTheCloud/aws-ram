import { awscdk, ReleasableCommits, SampleFile } from 'projen';
import { GithubCredentials } from 'projen/lib/github';
import { AppPermission } from 'projen/lib/github/workflows-model';
import { TrailingComma } from 'projen/lib/javascript';
import { VsCode } from 'projen/lib/vscode';

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Antonio Márquez Pérez',
  authorAddress: 'antonio.marquez@jumptothecloud.tech',
  cdkVersion: '2.173.0',
  constructsVersion: '10.4.2',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.7.0',
  name: 'aws-ram',
  keywords: ['aws', 'cdk', 'ram', 'resource access manager'],
  projenrcTs: true,
  repositoryUrl: 'git@github.com:JumpToTheCloud/aws-ram.git',
  prettier: true,
  prettierOptions: {
    settings: {
      trailingComma: TrailingComma.ES5,
      singleQuote: true,
      bracketSpacing: true,
      semi: true,
    },
  },
  autoMerge: false,
  releasableCommits: ReleasableCommits.featuresAndFixes(),
  publishDryRun: true,
  description: 'AWS CDK L2 construct for Resource Access Manager',
  devDeps: ['commitizen', 'cz-customizable', 'jest-runner-groups'],
  packageName: '@jttc/aws-ram',
  githubOptions: {
    projenCredentials: GithubCredentials.fromApp({
      permissions: {
        pullRequests: AppPermission.WRITE,
        contents: AppPermission.WRITE,
      },
    }),
  },
});

project.addTask('commit', {
  description:
    'Commit changes with conventional commits prompts provided by Commitizen',
  steps: [
    {
      exec: './node_modules/cz-customizable/standalone.js',
      receiveArgs: false,
      say: 'committing changes',
    },
  ],
});

const snapsthoTest = project.addTask('test:snapshot', {
  description: 'Snapshots Tests',
  steps: [
    {
      exec: 'jest --group=snapshot --collectCoverage=false',
      say: 'Snapshots Tests',
      receiveArgs: true,
    },
  ],
});

project.addTask('test:snapshot:update', {
  description: 'Update snapshots',
  steps: [
    {
      exec: 'jest --updateSnapshot --collectCoverage=false',
      say: 'Updating snapshots',
      receiveArgs: true,
    },
  ],
});

const testTask = project.tasks.tryFind('test');
const eslintTask = project.tasks.tryFind('eslint');

if (testTask && eslintTask) {
  testTask.reset();
  testTask.spawn(snapsthoTest);
  testTask.spawn(eslintTask);
}

new SampleFile(project, '.nvmrc', {
  contents: 'v22.12.0',
});

const vscode = new VsCode(project);
vscode.settings.addSettings({
  'editor.formatOnSave': true,
  'editor.indentSize': 2,
  'editor.defaultFormatter': 'esbenp.prettier-vscode',
});

project.synth();
