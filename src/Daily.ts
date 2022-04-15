/* eslint-disable max-len */
import axios, {AxiosRequestConfig} from 'axios';
const fs = require('fs');
require('dotenv').config();

interface File {
  filename: string;
  status: string; // Modified, Renamed, Removed, Added
  additions: number;
  deletions: number;
  changes: number;
  patch: string; // Modified, Removed, Added
  previous_filename: string; // Renamed
}

interface Commit {
  date: string;
  committer: string;
  message: string;
  stats: number[];
  files: File[];
}

/**
 * Elaborate files returned from the commit request
 * @param {any[]} files list
 * @return {File[]}
 */
function elaborateFiles(files) : File[] {
  const res = [];

  files.forEach((file: any) => {
    const elFile = {
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
    };

    if (file.hasOwnProperty('previous_filename')) {
      elFile['previous_filename'] = file.previous_filename;
    } else {
      elFile['patch'] = file.patch;
    }

    res.push(elFile);
  });

  return res;
}

/**
 * Generate Markdown Report for file details
 * @param {number} day
 * @param {File[]} files
 */
function generateMarkdownFileReport(day, files) {
  const filename = `./reports/Daily/${day}/FileReport.md`;

  let content = `# ${process.env.TOPIC} - 100 Days of Code: Day ${day} File Report`;

  files.forEach((file: File) => {
    content += `\n\n---\n### - Filename: ${file.filename}
#### Status: _${file.status}_\n
_Additions_: \`${file.additions}\`
_Deletions_: \`${file.deletions}\`
_Changes_: \`${file.changes}\`\n\n`;

    if (file.status === 'renamed') {
      content += `__Previous Filename__: \`${file.previous_filename}\``;
    } else {
      content += `\`\`\`diff
${file.patch}
\`\`\``;
    }
  });

  fs.writeFileSync(filename, content);
}

/**
 * Generate Markdown Report
 * @param {number} day
 * @param {string} startDate
 * @param {Commit} info
 */
function generateMarkdownReport(day, startDate, info) : void {
  const filename = `./reports/Daily/${day}/Report.md`;

  const diffTime = Math.abs(new Date(startDate).getTime() - new Date(info.date).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const content = `# ${process.env.TOPIC} - 100 Days of Code: Day ${day}\n
## Summary\n
_Commit Message_: \`${info.message}\`
_Date_: \`${info.date.split('T')[0]}\`
_Challenge Start date_: \`${startDate.split('T')[0]}\`
_In Line with the schedule_: \`${diffDays === day ? 'YES' : 'NO'}\`\n
_Added Rows_: \`${info.stats[1]}\`
_Removed Rows_: \`${info.stats[2]}\`
_Total changed Rows_: \`${info.stats[0]}\`\n
## Description\n
=== DESCRIPTION ===\n
> Files details found in FileReport.md`;

  fs.writeFileSync(filename, content);
}

/**
 * Generate report of given commit information
 * @param {Commit} info
 */
function generateDailyReport(info) : void {
  // eslint-disable-next-line max-len
  const challengeInfo = JSON.parse(
      fs.readFileSync('./reports/Daily/Day.json', 'utf-8').toString(),
  );

  challengeInfo.day = challengeInfo.day + 1;
  fs.writeFileSync('./reports/Daily/Day.json', JSON.stringify(challengeInfo));

  fs.mkdirSync('./reports/Daily/' + challengeInfo.day);

  generateMarkdownReport(challengeInfo.day, challengeInfo.start_date, info);
  generateMarkdownFileReport(challengeInfo.day, info.files);
}


const today = new Date().toISOString().split('T')[0] + 'T00:00:01Z';

const config: AxiosRequestConfig = {
  method: 'get',
  url: `https://api.github.com/repos/${process.env.OWNER}/${process.env.REPO}/commits?since=${today}`,
};

axios(config)
    .then(function(response) {
      const getCommitConfig: AxiosRequestConfig = {
        method: 'get',
        url: response.data[0].url,
      };

      axios(getCommitConfig)
          .then(function(commitResponse) {
            const data = commitResponse.data;
            const info: Commit = {
              date: data.commit.committer.date,
              committer: data.commit.committer.name,
              message: data.commit.message,
              stats: [
                data.stats.total,
                data.stats.additions,
                data.stats.deletions,
              ],
              files: elaborateFiles(data.files),
            };

            generateDailyReport(info);
          })
          .catch(function(error) {
            console.error(error);
          });
    })
    .catch(function(error) {
      console.error(error);
    });
