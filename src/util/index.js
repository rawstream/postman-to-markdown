"use strict";
const fs = require("fs");
const chalk = require(`chalk`);
/**
 * Create structure of markdown documentation
 * @param {object} docJson
 * @return {strinf} structure of markdown
 */
function createStructureOfMarkdown(docJson) {
  let markdown = "";
  markdown += `# ${docJson.info?.name}\n`;
  markdown +=
    docJson.info.description !== undefined
      ? `${docJson.info.description || ""}\n`
      : ``;

  markdown += readAuthorization(docJson.auth, 0);
  markdown += readItems(docJson.item);

  return markdown;
}

/**
 * Read auth of each method
 * @param {object} auth
 */
function readAuthorization(auth, folderDeep = 1) {
  let markdown = "";
  if (auth && auth.type !== "noauth") {
    markdown += `##${'#'.repeat(Math.min(folderDeep, 4))} 🔑 Authorization (${auth.type})\n`;
    markdown += `\n`;
    markdown += `|Key|Value|Type|\n`;
    markdown += `|---|---|---|\n`;
    if (auth.bearer) {
      if(auth.bearer.token) {
        markdown += `|token|${auth.bearer.token}|\n`;
      } else {
        auth.bearer.map((_) => {
          markdown += `|${_.key}|${_.value}|${_.type}|\n`;
        });
      }
    }
    markdown += `\n`;
    markdown += `\n`;
  }

  return markdown;
}

/**
 * Read request of each method
 * @param {object} request information
 * @return {string} info of data about request options
 */
function readRequestOptions(request, folderDeep = 1) {
  let markdown = "";
  if (request) {
    request.header.map((header) => {
      markdown += `##${'#'.repeat(Math.min(folderDeep, 4))} Headers\n`;
      markdown += `\n`;
      markdown += `|Key|Value|\n`;
      markdown += `|---|---|\n`;
      markdown += `|${header.key}|${header.value}|\n`;
      markdown += `\n`;
      markdown += `\n`;
    });
  }
  return markdown;
}

function readQueryParams(url, folderDeep = 1) {
  let markdown = "";
  if (url?.query) {
    markdown += `##${'#'.repeat(Math.min(folderDeep, 4))} Query Params\n`;
    markdown += `\n`;
    markdown += `|Key|Description|Example|\n`;
    markdown += `|---|---|---|\n`;
    url.query.map((query) => {
      markdown += `|${query.key}|${query.description}|${query.value}|\n`;
    });
    markdown += `\n`;
    markdown += `\n`;
  }

  return markdown;
}
function readPathVariables(url, folderDeep = 1) {
  let markdown = "";
  if (url?.variable) {
    markdown += `##${'#'.repeat(Math.min(folderDeep, 4))} Path Params\n`;
    markdown += `\n`;
    markdown += `|Key|Description|Example|\n`;
    markdown += `|---|---|---|\n`;
    url.variable.map((path) => {
      if (path.key) markdown += `|${path.key}|${path.description ?? ''}|${path.value ?? ''}|\n`;
    });
    markdown += `\n`;
    markdown += `\n`;
  }

  return markdown;

}

/**
 * Read objects of each method
 * @param {object} body
 */
function readFormDataBody(body, folderDeep = 1) {
  let markdown = "";

  if (body) {
    if (body.mode === "raw") {
      const language = body.options?.raw?.language;
      markdown += `##${'#'.repeat(Math.min(folderDeep, 4))} Body (**${language ?? body.mode}**)\n`;
      markdown += `\n`;
      markdown += `\`\`\`${language || ''}\n`;
      markdown += `${body.raw}\n`;
      markdown += `\`\`\`\n`;
      markdown += `\n`;
    }

    if (body.mode === "formdata") {
      markdown += `##${'#'.repeat(Math.min(folderDeep, 4))} Body ${body.mode}\n`;
      markdown += `\n`;
      markdown += `|Param|value|Type|\n`;
      markdown += `|---|---|---|\n`;
      body.formdata.map((form) => {
        markdown += `|${form.key}|${
          form.type === "file"
            ? form.src
            : form.value !== undefined
            ? form.value.replace(/\\n/g, "")
            : ""
        }|${form.type}|\n`;
      });
      markdown += `\n`;
      markdown += `\n`;
    }
  }

  return markdown;
}

/**
 * Read methods of response
 * @param {array} responses
 */
function readResponse(responses, folderDeep) {
  let markdown = "";
  if (responses?.length) {
    responses.forEach((response) => {
          markdown += `##${'#'.repeat(Math.min(folderDeep, 4))} Example Response (HTTP ${response.code})\n`;
          markdown += `\`\`\`json\n`;
          markdown += `${response.body}\n`;
          markdown += `\`\`\`\n`;
          markdown += `\n`;
    });
  }
  return markdown;
}

/**
 * Read methods of each item
 * @param {object} post
 */
function readMethods(method, folderDeep = 1) {
  let markdown = "";

  markdown += `\n`;
  markdown += `#${'#'.repeat(Math.min(folderDeep, 5))} \`${method.request?.method}\` ${method.name}\n`;
  markdown +=
    method?.request?.description !== undefined
      ? `${method?.request?.description || ""}\n`
      : ``;
  markdown += `>\`\`\`\n`;
  markdown += `>${method?.request?.url?.raw}\n`;
  markdown += `>\`\`\`\n`;
  markdown += readRequestOptions(method?.request, folderDeep);
  markdown += readFormDataBody(method?.request?.body, folderDeep);
  markdown += readQueryParams(method?.request?.url, folderDeep);
  markdown += readPathVariables(method?.request?.url, folderDeep);
  markdown += readAuthorization(method?.request?.auth, folderDeep);
  markdown += readResponse(method?.response, folderDeep);
  markdown += `\n`;
  markdown += `⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃\n`;

  return markdown;
}

/**
 * Read items of json postman
 * @param {Array} items
 */
function readItems(items, folderDeep = 2) {
  let markdown = "";
  items.forEach((item) => {
    if (item.item instanceof Array) {
      markdown += `${"#".repeat(folderDeep)} 📁 ${item.name} \n`;
      markdown += `${item.description} \n`;
      markdown += `\n`;

      item.item.forEach((item) => {
        if (item.item instanceof Array) {
          markdown += readItems(item.item, folderDeep + 1);
        } else {
          markdown += readMethods(item, folderDeep);
        }
      });
    } else {
      markdown += readMethods(item);
    }
  });

  return markdown;
}

/**
 * Create file
 * @param {string} content
 */
function writeFile(content, fileName, path) {
  const pathFile = path === undefined ? `${fileName}.md` : `${path}/${fileName}.md`;
  
  fs.writeFile(pathFile, content, function (err) {
    if (err) throw err;
    console.log(
      chalk.green(`Documentation was created correctly ${pathFile}`)
    );
  });
}

module.exports = {
  createStructureOfMarkdown,
  writeFile,
};
