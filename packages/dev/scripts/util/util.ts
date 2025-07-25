import fs from "node:fs";
import path from "node:path";
import { objMap, tos } from "^jab";
import { allPackagesIncludingPrivate, projectRoot } from "^dev/project.conf";
import fetch, { HeadersInit, RequestInit } from "node-fetch";

/**
 *
 */
export const fetchText = (
  url: string,
  headers?: HeadersInit,
  options?: RequestInit
) =>
  fetch(url, { ...(options || {}), headers }).then((response) =>
    response.text()
  );

/**
 *
 */
export const fetchJson = (
  url: string,
  headers?: HeadersInit,
  options?: RequestInit
) =>
  fetch(url, {
    ...(options || {}),
    headers,
  }).then((response) => response.json());

/**
 *
 */
export const postJson = (
  url: string,
  body: {},
  headers?: HeadersInit,
  options?: RequestInit
) =>
  fetch(url, {
    ...(options || {}),
    method: "post",
    body: JSON.stringify(body),
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });

/**
 *
 */
export const postJsonGetJson = (url: string, body: {}, headers?: HeadersInit) =>
  postJson(url, body, headers).then((response) => response.json());
