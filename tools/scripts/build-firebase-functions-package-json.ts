import * as path from 'path';
import depcheck = require('depcheck');
import * as fs from 'fs';

const packageJson = require('../../package.json') // Take root NX package.json
const ROOT_PATH = path.resolve(__dirname + '/../..')
const distProjectPath = `${ROOT_PATH}/dist/apps/functions`

console.log('Creating cloud functions package.json file...')

let packageJsonStub = {
  engines: { node: '12' },
  main: 'main.js',
}

depcheck(
  distProjectPath,
  {
    package: {
      dependencies: packageJson.dependencies,
    },
  },
  unused => {
    let dependencies = packageJson.dependencies
    if (unused.dependencies.length > 0)
      console.log('Deleting unused dependencies:')
    unused.dependencies.reduce((acc, dep, i) => {
      console.log(`${i + 1} - Deleting ${dep}`)
      delete acc[dep]
      return acc
    }, dependencies)

    fs.promises.mkdir(path.dirname(distProjectPath), { recursive: true }).then(() => {
      fs.promises.writeFile(
        `${distProjectPath}/package.json`,
        JSON.stringify({
          ...packageJsonStub,
          dependencies,
        })
      )
        .then(() =>
          console.log(`${distProjectPath}/package.json written successfully.`)
        )
        .catch(e => console.error(e))
    })
  }
)