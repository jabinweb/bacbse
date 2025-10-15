import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseContent() {
  try {
    console.log('🔍 Database Content Check\n');
    console.log('=' .repeat(50));

    // Check Classes
    console.log('\n📚 CLASSES:');
    const classes = await prisma.class.findMany({
      orderBy: { name: 'asc' }
    });
    classes.forEach(cls => {
      console.log(`  • ${cls.name} (ID: ${cls.id}) - ${cls.description}`);
    });

    // Check Class 4 specifically
    const class4 = await prisma.class.findFirst({
      where: { name: 'Class 4' },
      include: {
        subjects: {
          include: {
            chapters: {
              include: {
                topics: {
                  include: {
                    content: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (class4) {
      console.log('\n🎯 CLASS 4 DETAILED STRUCTURE:');
      console.log(`Class: ${class4.name} (ID: ${class4.id})`);
      
      class4.subjects.forEach(subject => {
        console.log(`\n  📖 Subject: ${subject.name} (ID: ${subject.id})`);
        console.log(`      Order: ${subject.orderIndex}, Color: ${subject.color}`);
        
        subject.chapters.forEach(chapter => {
          console.log(`\n    📑 Chapter: ${chapter.name} (ID: ${chapter.id})`);
          console.log(`        Order: ${chapter.orderIndex}`);
          
          chapter.topics.forEach(topic => {
            console.log(`\n      🎯 Topic: ${topic.name} (ID: ${topic.id})`);
            console.log(`          Type: ${topic.type}`);
            console.log(`          Description: ${topic.description || 'No description'}`);
            console.log(`          Order: ${topic.orderIndex}`);
            
            if (topic.content) {
              console.log(`\n        📄 Content (ID: ${topic.content.id}):`);
              console.log(`            Content Type: ${topic.content.contentType}`);
              console.log(`            URL: ${topic.content.url || 'null'}`);
              console.log(`            Video URL: ${topic.content.videoUrl || 'null'}`);
              console.log(`            PDF URL: ${topic.content.pdfUrl || 'null'}`);
              
              if (topic.content.textContent) {
                const textPreview = topic.content.textContent.length > 100 
                  ? topic.content.textContent.substring(0, 100) + '...'
                  : topic.content.textContent;
                console.log(`            Text Content: ${textPreview}`);
                console.log(`            Text Content Length: ${topic.content.textContent.length} characters`);
                
                // Check if it's iframe content
                if (topic.content.textContent.includes('<iframe')) {
                  console.log(`            ✅ Contains iframe HTML`);
                }
              } else {
                console.log(`            Text Content: null`);
              }
              
              if (topic.content.widgetConfig) {
                console.log(`            Widget Config: ${JSON.stringify(topic.content.widgetConfig)}`);
              } else {
                console.log(`            Widget Config: null`);
              }
            } else {
              console.log(`        ❌ No content found for this topic`);
            }
          });
        });
      });
    } else {
      console.log('\n❌ Class 4 not found in database');
    }

    // Check all topic contents with IFRAME type
    console.log('\n🖼️ ALL IFRAME CONTENT:');
    const iframeContents = await prisma.topicContent.findMany({
      where: {
        contentType: 'IFRAME'
      },
      include: {
        topic: {
          include: {
            chapter: {
              include: {
                subject: {
                  include: {
                    class: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (iframeContents.length > 0) {
      iframeContents.forEach(content => {
        const className = content.topic.chapter.subject.class.name;
        const subjectName = content.topic.chapter.subject.name;
        const chapterName = content.topic.chapter.name;
        const topicName = content.topic.name;
        
        console.log(`\n  📍 ${className} > ${subjectName} > ${chapterName} > ${topicName}`);
        console.log(`      Content ID: ${content.id}`);
        console.log(`      Content Type: ${content.contentType}`);
        
        if (content.textContent) {
          console.log(`      Text Content Length: ${content.textContent.length} characters`);
          
          // Extract src URL from iframe if possible
          const srcMatch = content.textContent.match(/src=["']([^"']+)["']/);
          if (srcMatch) {
            console.log(`      Iframe Source: ${srcMatch[1]}`);
          }
          
          // Show preview
          const preview = content.textContent.length > 150 
            ? content.textContent.substring(0, 150) + '...'
            : content.textContent;
          console.log(`      Content Preview: ${preview}`);
        }
      });
    } else {
      console.log('  No IFRAME content found in database');
    }

    // Database statistics
    console.log('\n📊 DATABASE STATISTICS:');
    const stats = await Promise.all([
      prisma.class.count(),
      prisma.subject.count(),
      prisma.chapter.count(),
      prisma.topic.count(),
      prisma.topicContent.count(),
      prisma.user.count()
    ]);

    console.log(`  Classes: ${stats[0]}`);
    console.log(`  Subjects: ${stats[1]}`);
    console.log(`  Chapters: ${stats[2]}`);
    console.log(`  Topics: ${stats[3]}`);
    console.log(`  Topic Contents: ${stats[4]}`);
    console.log(`  Users: ${stats[5]}`);

    // Content type breakdown
    console.log('\n📈 CONTENT TYPE BREAKDOWN:');
    const contentTypes = await prisma.topicContent.groupBy({
      by: ['contentType'],
      _count: {
        contentType: true
      }
    });

    contentTypes.forEach(type => {
      console.log(`  ${type.contentType}: ${type._count.contentType}`);
    });

    console.log('\n✅ Database check completed!');

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseContent();