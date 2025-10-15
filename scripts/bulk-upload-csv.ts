/**
 * Bulk Upload Script - Complete Data Refresh
 * 
 * This script wipes out all existing data and rebuilds everything from CSV.
 * 
 * CSV Format (11 columns):
 * class_name, subje  console.log('🗑️ Clearing existing data...');t_name, subject_order, chapter_name, chapter_order, 
 * topic_name, topic_type, topic_description, topic_difficulty, content_type, content_url
 * 
 * Behavior:
 * - Clears all existing data (topics, chapters, subjects, classes)
 * - Creates everything fresh from CSV
 * - Complete rebuild with difficulty levels
 * 
 * Difficulty Values:
 * - BEGINNER, EASY, BASIC → BEGINNER
 * - INTERMEDIATE, MEDIUM, MODERATE → INTERMEDIATE  
 * - ADVANCED, HARD, DIFFICULT, EXPERT → ADVANCED
 * - Default: BEGINNER (if not provided or invalid)
 * 
 * Warning: This will delete all existing educational content!
 */

import { PrismaClient, TopicType, ContentType, DifficultyLevel } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

const prisma = new PrismaClient();

interface CSVRow {
  class_name?: string;
  subject_name?: string;
  subject_order?: string;
  chapter_name?: string;
  chapter_order?: string;
  topic_name?: string;
  topic_type?: string;
  topic_description?: string;
  topic_difficulty?: string;
  content_type?: string;
  content_url?: string;
  [key: string]: string | undefined;
}

interface ProcessedData {
  classes: Map<string, {
    subjects: Map<string, {
      order: number;
      chapters: Map<string, {
        order: number;
        topics: Array<{
          name: string;
          type: string;
          description: string;
          difficulty: string;
          contentType: string;
          contentUrl: string;
          order: number;
        }>;
      }>;
    }>;
  }>;
}

// Helper functions to convert types to database enums
function convertToTopicType(type: string): TopicType {
  switch (type.toUpperCase()) {
    case 'VIDEO': return TopicType.VIDEO;
    case 'INTERACTIVE': return TopicType.INTERACTIVE;
    case 'EXERCISE': return TopicType.EXERCISE;
    case 'AUDIO': return TopicType.AUDIO;
    default: return TopicType.INTERACTIVE;
  }
}

function convertToContentType(type: string): ContentType {
  switch (type.toUpperCase()) {
    case 'VIDEO': return ContentType.VIDEO;
    case 'IFRAME': return ContentType.IFRAME;
    case 'HTML': return ContentType.IFRAME; // Map HTML to IFRAME
    case 'AUDIO': return ContentType.EXTERNAL_LINK; // Map AUDIO to EXTERNAL_LINK
    case 'PDF': return ContentType.PDF;
    case 'TEXT': return ContentType.TEXT;
    case 'INTERACTIVE_WIDGET': return ContentType.INTERACTIVE_WIDGET;
    case 'EXTERNAL_LINK': return ContentType.EXTERNAL_LINK;
    default: return ContentType.IFRAME;
  }
}

function convertToDifficultyLevel(difficulty: string): DifficultyLevel {
  switch (difficulty.toUpperCase()) {
    case 'BEGINNER': 
    case 'EASY': 
    case 'BASIC': 
      return DifficultyLevel.BEGINNER;
    case 'INTERMEDIATE': 
    case 'MEDIUM': 
    case 'MODERATE': 
      return DifficultyLevel.INTERMEDIATE;
    case 'ADVANCED': 
    case 'HARD': 
    case 'DIFFICULT': 
    case 'EXPERT': 
      return DifficultyLevel.ADVANCED;
    default: 
      return DifficultyLevel.BEGINNER; // Default to BEGINNER
  }
}

// Helper function to get subject colors
function getSubjectColor(subjectName: string): string {
  const name = subjectName.toLowerCase();
  if (name.includes('english')) return 'from-blue-500 to-blue-600';
  if (name.includes('evs') || name.includes('environment')) return 'from-green-500 to-green-600';
  if (name.includes('math') || name.includes('mathematics')) return 'from-purple-500 to-purple-600';
  if (name.includes('science')) return 'from-teal-500 to-teal-600';
  if (name.includes('social') || name.includes('history')) return 'from-orange-500 to-orange-600';
  if (name.includes('hindi')) return 'from-red-500 to-red-600';
  return 'from-gray-500 to-gray-600'; // Default color
}

// Helper function to get subject icons
function getSubjectIcon(subjectName: string): string {
  const name = subjectName.toLowerCase();
  if (name.includes('english')) return '📚';
  if (name.includes('evs') || name.includes('environment')) return '🌍';
  if (name.includes('math') || name.includes('mathematics')) return '🔢';
  if (name.includes('science')) return '🔬';
  if (name.includes('social') || name.includes('history')) return '🏛️';
  if (name.includes('hindi')) return '🇮🇳';
  return '📖'; // Default icon
}

// Subject price mapping based on our previous price structure
const getSubjectPrice = (className: string, subjectName: string): number => {
  // Prices in paisa (₹1 = 100 paisa)
  if (subjectName.toLowerCase().includes('english')) {
    if (className === 'Class 4' || className === 'Class 5') {
      return 24900; // ₹249
    } else {
      return 29900; // ₹299
    }
  }
  return 29900; // ₹299 for all other subjects
};



// Function to parse CSV and organize data
async function parseCSV(): Promise<ProcessedData> {
  return new Promise((resolve, reject) => {
    const csvPath = path.join(__dirname, 'bulk-uploader.csv');
    const data: ProcessedData = {
      classes: new Map()
    };

    console.log('📁 Reading CSV file from:', csvPath);
    console.log('💡 CSV should include difficulty column (BEGINNER/INTERMEDIATE/ADVANCED). Defaults to BEGINNER if not provided.');
    console.log('⚠️  WARNING: This will delete ALL existing data and rebuild from CSV!');

    fs.createReadStream(csvPath)
      .pipe(csv({
        headers: ['class_name', 'subject_name', 'subject_order', 'chapter_name', 'chapter_order', 'topic_name', 'topic_type', 'topic_description', 'topic_difficulty', 'content_type', 'content_url']
      }))
      .on('data', (row: CSVRow) => {
        // Use only the first set of data (ignore duplicates)
        const className = row.class_name?.trim();
        const subjectName = row.subject_name?.trim();
        const chapterName = row.chapter_name?.trim();

        // Skip if any required field is missing
        if (!className || !subjectName || !chapterName || !row.topic_name || !row.topic_type || !row.topic_description || !row.content_type || !row.content_url) {
          return;
        }

        // Initialize class if it doesn't exist
        if (!data.classes.has(className)) {
          data.classes.set(className, { subjects: new Map() });
        }

        const classData = data.classes.get(className)!;

        // Initialize subject if it doesn't exist
        if (!classData.subjects.has(subjectName)) {
          classData.subjects.set(subjectName, {
            order: parseInt(row.subject_order || '1') || 1,
            chapters: new Map()
          });
        }

        const subjectData = classData.subjects.get(subjectName)!;

        // Initialize chapter if it doesn't exist
        if (!subjectData.chapters.has(chapterName)) {
          subjectData.chapters.set(chapterName, {
            order: parseInt(row.chapter_order || '1') || 1,
            topics: []
          });
        }

        const chapterData = subjectData.chapters.get(chapterName)!;

        // Add topic to chapter
        chapterData.topics.push({
          name: row.topic_name.trim(),
          type: row.topic_type.trim(),
          description: row.topic_description.trim(),
          difficulty: row.topic_difficulty?.trim() || 'BEGINNER',
          contentType: row.content_type.trim(),
          contentUrl: row.content_url.trim(),
          order: chapterData.topics.length + 1
        });
      })
      .on('end', () => {
        console.log('✅ CSV parsing completed successfully');
        resolve(data);
      })
      .on('error', (error) => {
        console.error('❌ Error parsing CSV:', error);
        reject(error);
      });
  });
}

// Function to clear existing data
async function clearExistingData() {
  console.log('� Validating data integrity...');
  
  try {
    // Delete in correct order to avoid foreign key constraints
    await prisma.topicContent.deleteMany();
    console.log('   ✅ Cleared topic content');

    await prisma.topic.deleteMany();
    console.log('   ✅ Cleared topics');
    
    await prisma.chapter.deleteMany();
    console.log('   ✅ Cleared chapters');
    
    await prisma.subject.deleteMany();
    console.log('   ✅ Cleared subjects');
    
    await prisma.class.deleteMany();
    console.log('   ✅ Cleared classes');
    
    console.log('🎯 Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

// Main bulk upload function
async function bulkUploadFromCSV() {
  console.log('🚀 Starting bulk upload from CSV...\n');

  try {
    // Step 1: Parse CSV data
    const processedData = await parseCSV();

    // Step 2: Clear existing data
    await clearExistingData();

    // Step 3: Create all data fresh from CSV
    console.log('\n📊 Creating database entries...\n');

    for (const [className, classData] of processedData.classes) {
      console.log(`🏫 Processing ${className}...`);

      // Find or create class
      let dbClass = await prisma.class.findFirst({
        where: { name: className }
      });

      if (!dbClass) {
        // Determine class price based on our price structure
        let classPrice = 69900; // Default ₹699 for Class 4-5
        if (['Class 6', 'Class 7', 'Class 8'].includes(className)) {
          classPrice = 89900; // ₹899 for Class 6-8
        }

        dbClass = await prisma.class.create({
          data: {
            name: className,
            description: `Educational content for ${className}`,
            price: classPrice,
            currency: 'INR',
            isActive: true
          }
        });
        console.log(`   ✅ Created class: ${className} (₹${classPrice / 100})`);
      } else {
        console.log(`   ℹ️ Using existing class: ${className}`);
      }

      // Process subjects
      for (const [subjectName, subjectData] of classData.subjects) {
        // Process subjects
        const subjectPrice = getSubjectPrice(className, subjectName);
        const subjectColor = getSubjectColor(subjectName);
        const subjectIcon = getSubjectIcon(subjectName);

        const dbSubject = await prisma.subject.create({
          data: {
            name: subjectName,
            classId: dbClass.id,
            orderIndex: subjectData.order,
            icon: subjectIcon,
            color: subjectColor,
            price: subjectPrice,
            currency: 'INR',
            isLocked: false
          }
        });

        console.log(`     📚 Created subject: ${subjectName} (₹${subjectPrice / 100})`);

        // Process chapters
        for (const [chapterName, chapterData] of subjectData.chapters) {
          const dbChapter = await prisma.chapter.create({
            data: {
              name: chapterName,
              subjectId: dbSubject.id,
              orderIndex: chapterData.order
            }
          });

          console.log(`       📖 Created chapter: ${chapterName}`);

          // Process topics
          for (const topicData of chapterData.topics) {
            const dbTopic = await prisma.topic.create({
              data: {
                name: topicData.name,
                description: topicData.description,
                chapterId: dbChapter.id,
                orderIndex: topicData.order,
                type: convertToTopicType(topicData.type),
                difficulty: convertToDifficultyLevel(topicData.difficulty),
                duration: "5 min" // Default duration
              }
            });

            // Create topic content
            const contentType = convertToContentType(topicData.contentType);
            const contentData: {
              topicId: string;
              contentType: ContentType;
              url?: string;
              iframeHtml?: string;
            } = {
              topicId: dbTopic.id,
              contentType: contentType
            };

            // Handle different content types
            if (contentType === ContentType.IFRAME && topicData.contentUrl.includes('<iframe')) {
              // It's HTML iframe content
              contentData.iframeHtml = topicData.contentUrl;
            } else {
              // It's a URL
              contentData.url = topicData.contentUrl;
            }

            await prisma.topicContent.create({
              data: contentData
            });

            console.log(`         🎯 Created topic: ${topicData.name} (${topicData.difficulty})`);
          }
        }
      }

      console.log(`   ✅ Completed ${className}: ${classData.subjects.size} subjects\n`);
    }

    // Final verification
    const classCount = await prisma.class.count();
    const subjectCount = await prisma.subject.count();
    const chapterCount = await prisma.chapter.count();
    const topicCount = await prisma.topic.count();
    const contentCount = await prisma.topicContent.count();

    // Get difficulty distribution
    const difficultyStats = await prisma.topic.groupBy({
      by: ['difficulty'],
      _count: {
        difficulty: true
      }
    });

    console.log('\n📊 Final Summary:');
    console.log(`• Total Classes: ${classCount}`);
    console.log(`• Total Subjects: ${subjectCount}`);
    console.log(`• Total Chapters: ${chapterCount}`);
    console.log(`• Total Topics: ${topicCount}`);
    console.log(`• Total Content Items: ${contentCount}`);
    
    console.log('\n📈 Difficulty Distribution:');
    difficultyStats.forEach(stat => {
      console.log(`• ${stat.difficulty}: ${stat._count.difficulty} topics`);
    });
    
    console.log('\n🚀 Database is now populated with IFRAME-based educational content from CSV with difficulty levels!');

  } catch (error) {
    console.error('❌ Error during bulk upload:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the bulk upload
if (require.main === module) {
  bulkUploadFromCSV()
    .catch((e) => {
      console.error('❌ Bulk upload failed:', e);
      process.exit(1);
    });
}

export default bulkUploadFromCSV;
