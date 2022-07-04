import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Logger } from 'winston';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CSV, CSVDocument } from '../models/csv.schema';
import { parse } from 'papaparse';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const appRoot = require('app-root-path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs/promises');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const walk = require('walk');

@Injectable()
export class CSVService {
  constructor(
    private httpService: HttpService,
    @Inject('winston')
    private readonly logger: Logger,
    @InjectModel(CSV.name) private csvModel: Model<CSVDocument>,
  ) {}

  async addOne(filename: string, username: string, tags: string[]) {
    try {
      const dataset = await this.readFile(filename, username, tags);
      dataset.forEach((record) => record.save());
      return true;
    } catch (e) {
      return false;
    }
  }

  async viewAll(username: string) {
    const records = await this.csvModel.find({ username: username }).exec();
    const columnNames = new Set();
    for (const record of records) {
      const c = record.content;
      const keys = Object.keys(c);
      keys.forEach((x) => {
        columnNames.add(x);
      });
    }
    const columns = Array.from(columnNames).map((column) => {
      return {
        field: column,
        headerName: column,
        minWidth: 200,
        type: 'string',
        resizable: true,
        editable: true,
      };
    });
    const rows = records.map((x) => {
      return { id: x.id, tags: x.tags, ...x.content };
    });
    return {
      columns: [
        {
          field: 'tags',
          headerName: 'Tags',
          align: 'right',
          sortable: false,
          valueFormatter: (params) => `$${params.value}`,
          hide: true,
          lockVisible: false,
        },
        ...columns,
      ],
      rows,
    };
  }

  async viewByTags(username: string, tags: string[]) {
    return this.csvModel.find({ username: username, tags: tags }).exec();
  }

  async readFile(filename: string, username: string, tags: string[]) {
    const file_location = process.env.CSV_PATH + '/' + filename;
    const data = await fs.readFile(file_location);
    const csvData = data.toString();
    const parsedCSV = await parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => results.data,
    });
    return parsedCSV?.data.map((record) => {
      return new this.csvModel({
        name: filename,
        username: username,
        tags: tags,
        content: record,
      });
    });
  }
}
