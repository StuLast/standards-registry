import fetch from 'node-fetch';
import { stringify } from 'qs';
import { findKey } from 'lodash';
const { CKAN_URL, PAGES_CKAN_URL } = process.env;

const DEFAULT_SORT = {
  score: 'desc',
  metadata_created: 'desc',
};

// TODO: neaten
export function queriseSelections(selections) {
  const selectionsRef = { ...selections };
  const query = {};
  if (!selections) return;

  for (const prop in selections) {
    if (typeof selections[prop] === 'boolean') {
      query[prop] = selectionsRef[prop];
      continue;
    }
    if (typeof selections[prop] === 'string') {
      selectionsRef[prop] = [selectionsRef[prop]];
    }
    // sanitise "Appointment / thing" => "Appointment"
    selectionsRef[prop] = selectionsRef[prop].map((i) => i.split(' ').shift());
    if (selectionsRef[prop].length) {
      query[prop] = `(*${selectionsRef[prop].join('* AND *')}*)`;
    } else {
      delete query[prop];
    }
  }
  return query;
}

function getSearchQuery(q) {
  if (!q) {
    return undefined;
  }

  let query = `(title:${q}~ OR ${q})`;

  const organisationMappings = {
    'professional-record-standards-body': [
      'prsb',
      'professional record standards body',
      'professional records standards body',
    ],
    'nhs-digital': ['nhs', 'nhsd', 'nhsx', 'nhs digital'],
  };

  const org = findKey(organisationMappings, (mappings) =>
    mappings.includes(q.toLowerCase())
  );

  if (org) {
    query = `(organization:${org} OR ${query})`;
  }

  return query;
}

// helper function for building SOLR Filter Queries into package_search
// e.g. // /package_search?fq=(care_setting:(*Dentistry*%20OR%20*Community*)%20OR%20business_use:(*Continuity*))
export function serialise(obj = {}) {
  if (Object.keys(obj).length === 0) {
    return;
  }
  const str = Object.keys(obj)
    .reduce((acc, key) => {
      acc.push(key + ':' + obj[key]);
      return acc;
    }, [])
    .join(' AND ');
  return `(${str})`;
}

export async function read({ id }) {
  const response = await fetch(`${CKAN_URL}/package_show?id=${id}`);
  const data = await response.json();
  return data.result;
}

export async function getPages() {
  const response = await fetch(`${PAGES_CKAN_URL}/ckanext_pages_list`);
  const data = await response.json();
  return data.result;
}

export async function list({
  page = 1,
  q,
  sort,
  inactive,
  orderBy,
  order,
  ...filters
}) {
  if (!sort) {
    if (orderBy) {
      sort = {
        [orderBy]: order || 'asc',
      };
    } else {
      sort = DEFAULT_SORT;
    }
  }

  let sortstring, fq;
  const rows = 10;

  const start = (page - 1) * rows;
  // e.g.
  // sort=score desc, metadata_modified desc
  if (typeof sort === 'string') {
    sortstring = sort;
  } else {
    sortstring = Object.entries(sort)
      .map((i) => i.join(' '))
      .join(', ');
  }

  filters.is_published_standard = !inactive;

  fq = serialise(queriseSelections(filters));

  const query = getSearchQuery(q);
  const ckanQuery = stringify({ q: query, fq, rows, start, sort: sortstring });
  const response = await fetch(`${CKAN_URL}/package_search?${ckanQuery}`);
  const data = await response.json();
  return data.result;
}

export async function schema(dataset = 'dataset') {
  const response = await fetch(
    `${CKAN_URL}/scheming_dataset_schema_show?type=${dataset}`
  );
  const data = await response.json();

  return data.result;
}

export async function filterSearch(query = '') {
  // /package_search?fq=(care_setting:(*Dentistry*%20OR%20*Community*)%20AND%20business_use:(*Continuity*))
  const response = await fetch(`${CKAN_URL}/package_search${query}`);

  const data = await response.json();
  return data.result;
}
