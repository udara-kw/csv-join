import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CSVDocument = CSV & Document;

@Schema()
export class CSV {
  @Prop()
  name: string;

  @Prop()
  tag: string[];
}

export const CSVSchema = SchemaFactory.createForClass(CSV);
