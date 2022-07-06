import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Logger } from 'winston';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CSV, CSVDocument } from '../models/csv.schema';
import { parse } from 'papaparse';
import { statSync } from 'fs';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const appRoot = require('app-root-path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs/promises');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const walk = require('walk');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AdmZip = require('adm-zip');

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
        editable: true,
      };
    });
    const rows = records.map((record) => {
      return {
        id: record.id,
        tags: record.tags,
        filename: record.name,
        ...record.content,
      };
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
        {
          field: 'filename',
          headerName: 'Filename',
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

  async uploadFile(files, tags: string[], username: string) {
    for (const csvFile of files) {
      const fileData = JSON.parse(csvFile);
      try {
        const filename = fileData.file.path;
        const decodedData = atob(fileData.data.split(',')[1]);
        await fs.writeFile('./uploadCSVFiles/' + filename, decodedData);
        const parsedCSV = await parse(decodedData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => results.data,
        });
        parsedCSV?.data.map((record) => {
          return new this.csvModel({
            name: filename,
            username: username,
            tags: tags,
            content: record,
          });
        });
      } catch (e) {
        console.log(e);
        throw new HttpException(e, HttpStatus.NOT_ACCEPTABLE);
      }
    }
    return { success: true };
  }

  async downloadFiles(filenames: string[], username: string) {
    const zip = new AdmZip();
    try {
      for (const filename of filenames) {
        const filepath = appRoot + '/uploadCSVFiles/' + filename;
        zip.addLocalFile(filepath);
      }
      return zip.toBuffer();
    } catch (e) {
      console.log(e);
      throw new HttpException(e, HttpStatus.NO_CONTENT);
    }
  }

  async viewAllFiles(username: string) {
    const files = await this.csvModel.find({ username: username });
    const filenames = [
      ...new Set(
        files.map((file) => {
          return file.name;
        }),
      ),
    ];

    const tags = [
      ...new Set(
        files.map((file) => {
          return file.tags;
        }),
      ),
    ];

    const rows = filenames.map((file, index) => {
      const filepath = join(process.cwd(), 'uploadCSVFiles', file);
      const stats = statSync(filepath);
      return {
        id: file,
        name: file,
        size: stats.size,
        created: stats.birthtime,
        tags: tags[index],
      };
    });
    const columns = [
      {
        field: 'name',
        headerName: 'Filename',
        minWidth: 400,
        type: 'string',
        editable: true,
      },
      {
        field: 'size',
        headerName: 'File size (bytes)',
        minWidth: 200,
        type: 'string',
        editable: true,
      },
      {
        field: 'created',
        headerName: 'Created on',
        minWidth: 300,
        type: 'string',
        editable: true,
      },
      {
        field: 'tags',
        headerName: 'Tags',
        align: 'right',
        sortable: false,
        valueFormatter: (params) => `$${params.value}`,
        hide: true,
        lockVisible: false,
      },
    ];
    return { rows, columns };
  }
}
