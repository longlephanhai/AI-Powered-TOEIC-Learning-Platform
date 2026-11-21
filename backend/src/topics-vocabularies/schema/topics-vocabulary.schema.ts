import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Vocabulary } from 'src/vocabularies/schema/vocabulary.schema';


export type TopicsVocabularyDocument = HydratedDocument<TopicsVocabulary>;

@Schema({ timestamps: true, })
export class TopicsVocabulary {

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: Vocabulary.name }] })
  vocabularies: Vocabulary[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  }

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  }

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  }

  @Prop()
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const TopicsVocabularySchema = SchemaFactory.createForClass(TopicsVocabulary);
