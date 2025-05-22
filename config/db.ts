import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    // console.log("MONGO_URI ENV:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI as string, {
      // opsi modern mongoose tidak perlu useNewUrlParser dsb (v7+)
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error((err as Error).message);
    // process.exit(1);
  }
};

export default connectDB;
