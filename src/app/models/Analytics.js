import mongoose from 'mongoose';

const pageViewSchema = new mongoose.Schema({
  page: String,
  duration: Number,
  timestamp: Date
});

const clickSchema = new mongoose.Schema({
  element: String,
  text: String,
  href: String,
  timestamp: Date
});

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  pageViews: [pageViewSchema],
  clicks: [clickSchema],
  userAgent: String,
  screenSize: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const searchSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  results: Number
});

const categoryClickSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const filterSchema = new mongoose.Schema({
  filter: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// General event analytics schema
const eventAnalyticsSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Dynamic fields from data
  userAgent: String,
  screenSize: String,
  query: String,
  results: Number,
  category: String,
  filters: mongoose.Schema.Types.Mixed,
  page: String,
  // Add any other fields that might be in the data
}, { 
  strict: false, // Allow additional fields
  timestamps: true 
});

// Create models if they don't exist
const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
const Search = mongoose.models.Search || mongoose.model('Search', searchSchema);
const CategoryClick = mongoose.models.CategoryClick || mongoose.model('CategoryClick', categoryClickSchema);
const Filter = mongoose.models.Filter || mongoose.model('Filter', filterSchema);
const EventAnalytics = mongoose.models.EventAnalytics || mongoose.model('EventAnalytics', eventAnalyticsSchema);

export { Session, Search, CategoryClick, Filter, EventAnalytics }; 