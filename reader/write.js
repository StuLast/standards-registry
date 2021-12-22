import { readFile, writeFile } from 'fs/promises';
import { createWriteStream } from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import slugify from 'slugify';
import path from 'path';

const config = dotenv.config('./.env').parsed;

const startTime = new Date();
const logTitle = `log-${startTime.toISOString()}.txt`;
const logStream = createWriteStream(path.resolve(logTitle), { flags: 'a' });

const orgs = {
  prsb: 'professional-record-standards-body',
  nhsd: 'nhs-digital',
};

const report = {
  total: 1,
  successes: 0,
  failures: 0,
};
const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const writeToCKAN = async ({
  fileLocation = './parsed.json',
  ckanUrl = config.CKAN_URL,
  ckanApiKey = config.CKAN_API_KEY,
}) => {
  const sheet = JSON.parse(
    await readFile(new URL(fileLocation, import.meta.url))
  );
  for (const record of sheet) {
    await sleep(150); //sleep .15s between hits to the api

    const { title, owner_org } = record;
    // Slugify titles in a similar fashion to CKAN auto-slug
    const name = slugify(title, { lower: true, strict: true });
    console.log('Proecessing record:', title);

    const params = {
      ...record,
      ...{
        name,
        owner_org: orgs[owner_org] || 'nhs-digital',
      },
    };

    try {
      const lookup =
        `${ckanUrl}/package_show?` +
        new URLSearchParams({
          id: name,
        });

      console.log(`searching for ${lookup}`);
      const response = await fetch(lookup);
      const check = await response.json();

      console.log('check response:', check);

      const endpoint = check.success
        ? `/package_update?id=${title}`
        : '/package_create';
      const action = check.success ? 'Update' : 'Create';

      console.log(`about to write to  ${ckanUrl}${endpoint}`);

      const write = await fetch(`${ckanUrl}${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          Authorization: ckanApiKey,
          'Content-Type': 'application/json',
        },
      });

      const writeData = await write.json();
      const { success } = writeData;
      const statusStr = success ? 'successful' : 'unsuccessful';
      const message = `${action} for "${title}" ${statusStr}`;
      const time = new Date();

      (success && report.successes++) || report.failures++;
      report.total++;

      console.log(message);

      logStream.write(`
      ${time.toUTCString()}
      ${message}
      ${JSON.stringify(writeData)}
      ----
      `);
    } catch (e) {
      console.log(`Error trying whilst working on ${title}`);
      console.log(e.stack);
    }
  }
  logStream.write(`
      -----------------------------
      Final report
      -----------------------------
      Total records processed: ${report.total}
      Successes: ${report.successes}
      Failures: ${report.failures}
      Time taken: ${(new Date() - startTime) / 1000}s
      -----------------------------
      `);
  logStream.end();
};