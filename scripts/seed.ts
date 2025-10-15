import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Create admin settings
    console.log('📋 Creating admin settings...');
    await prisma.adminSettings.createMany({
      data: [
        { key: 'paymentMode', value: 'test', description: 'Payment mode (test/live)' },
        { key: 'razorpayTestKeyId', value: 'rzp_test_pVCuJkKmit9XYt', description: 'Razorpay test key ID' },
        { key: 'razorpayTestKeySecret', value: 'XzXen6LzQcgKmAEscUTE9Evg', description: 'Razorpay test key secret' },
        { key: 'razorpayKeyId', value: 'rzp_live_PdFd0BZHdbvbpp', description: 'Razorpay live key ID' },
        { key: 'razorpayKeySecret', value: 'pO0sBEs7D1fuKbclGUSubJkF', description: 'Razorpay live key secret' },
        { key: 'siteName', value: 'ScioLabs', description: 'Site name' },
        { key: 'siteUrl', value: 'https://sciolabs.in', description: 'Site URL' },
        { key: 'contactEmail', value: 'info@sciolabs.in', description: 'Contact email' },
        { key: 'contactPhone', value: '+91 94952 12484', description: 'Contact phone' },
        { key: 'address', value: 'N-304, Ashiyana, Sector N, Lucknow, UP - 226012, India', description: 'Business address' }
      ],
      skipDuplicates: true
    });
    console.log('✅ Admin settings created');

    // Create/update sample school
    console.log('📋 Creating/updating sample school...');
    const school = await prisma.school.upsert({
      where: { email: 'info@sciolabs.in' },
      update: {
        name: 'ScioLabs',
        phone: '+91 94952 12484',
        address: 'N-304, Ashiyana, Sector N, Lucknow, UP - 226012, India',
        isActive: true
      },
      create: {
        name: 'ScioLabs',
        email: 'info@sciolabs.in',
        phone: '+91 94952 12484',
        address: 'N-304, Ashiyana, Sector N, Lucknow, UP - 226012, India',
        isActive: true
      }
    });
    console.log(`✅ Sample school created/updated with ID: ${school.id}`);

    // Create curriculum data
    const curriculumData = [
      {
        className: 'Class 4',
        price: 69900, // Rs.699 in paisa
        subjects: [
          { name: 'EVS', icon: '🌍', color: 'from-green-500 to-green-600', price: 29900 },
          { name: 'English', icon: '📚', color: 'from-blue-500 to-blue-600', price: 24900 },
          { name: 'Maths', icon: '🔢', color: 'from-purple-500 to-purple-600', price: 29900 }
        ]
      },
      {
        className: 'Class 5',
        price: 69900, // Rs.699 in paisa
        subjects: [
          { name: 'EVS', icon: '🌍', color: 'from-green-500 to-green-600', price: 29900 },
          { name: 'English', icon: '📚', color: 'from-blue-500 to-blue-600', price: 24900 },
          { name: 'Maths', icon: '🔢', color: 'from-purple-500 to-purple-600', price: 29900 }
        ]
      },
      {
        className: 'Class 6',
        price: 89900, // Rs.899 in paisa
        subjects: [
          { name: 'English', icon: '📚', color: 'from-blue-500 to-blue-600', price: 29900 },
          { name: 'Science', icon: '🧪', color: 'from-green-500 to-green-600', price: 29900 },
          { name: 'Social Studies', icon: '🏛️', color: 'from-orange-500 to-orange-600', price: 29900 },
          { name: 'Maths', icon: '🔢', color: 'from-purple-500 to-purple-600', price: 29900 }
        ]
      },
      {
        className: 'Class 7',
        price: 89900, // Rs.899 in paisa
        subjects: [
          { name: 'English', icon: '📚', color: 'from-blue-500 to-blue-600', price: 29900 },
          { name: 'Science', icon: '🧪', color: 'from-green-500 to-green-600', price: 29900 },
          { name: 'Social Studies', icon: '🏛️', color: 'from-orange-500 to-orange-600', price: 29900 },
          { name: 'Maths', icon: '🔢', color: 'from-purple-500 to-purple-600', price: 29900 }
        ]
      },
      {
        className: 'Class 8',
        price: 89900, // Rs.899 in paisa
        subjects: [
          { name: 'English', icon: '📚', color: 'from-blue-500 to-blue-600', price: 29900 },
          { name: 'Science', icon: '🧪', color: 'from-green-500 to-green-600', price: 29900 },
          { name: 'Social Studies', icon: '🏛️', color: 'from-orange-500 to-orange-600', price: 29900 },
          { name: 'Maths', icon: '🔢', color: 'from-purple-500 to-purple-600', price: 29900 }
        ]
      }
    ];

    console.log('📋 Creating/updating classes and subjects...');
    for (const classData of curriculumData) {
      // Check if class exists, then update or create
      console.log(`📚 Creating/updating ${classData.className}...`);
      
      const existingClass = await prisma.class.findFirst({
        where: { name: classData.className }
      });

      let createdClass;
      if (existingClass) {
        // Update existing class
        createdClass = await prisma.class.update({
          where: { id: existingClass.id },
          data: {
            description: `Complete curriculum for ${classData.className}`,
            price: classData.price,
            currency: 'INR',
            isActive: true
          }
        });
        console.log(`✅ Updated existing ${classData.className}`);
      } else {
        // Create new class
        createdClass = await prisma.class.create({
          data: {
            name: classData.className,
            description: `Complete curriculum for ${classData.className}`,
            price: classData.price,
            currency: 'INR',
            isActive: true
          }
        });
        console.log(`✅ Created new ${classData.className}`);
      }

      // Create/update subjects for this class
      for (let i = 0; i < classData.subjects.length; i++) {
        const subject = classData.subjects[i];
        console.log(`  📖 Creating/updating subject: ${subject.name}`);
        
        const existingSubject = await prisma.subject.findFirst({
          where: { 
            name: subject.name,
            classId: createdClass.id 
          }
        });

        let createdSubject;
        if (existingSubject) {
          // Update existing subject
          createdSubject = await prisma.subject.update({
            where: { id: existingSubject.id },
            data: {
              icon: subject.icon,
              color: subject.color,
              price: subject.price,
              currency: 'INR',
              orderIndex: i + 1,
              isLocked: false
            }
          });
          console.log(`    ✅ Updated existing subject: ${subject.name}`);
        } else {
          // Create new subject
          createdSubject = await prisma.subject.create({
            data: {
              name: subject.name,
              icon: subject.icon,
              color: subject.color,
              price: subject.price,
              currency: 'INR',
              orderIndex: i + 1,
              classId: createdClass.id,
              isLocked: false
            }
          });
          console.log(`    ✅ Created new subject: ${subject.name}`);
        }

        // Create/update sample chapters for each subject
        const sampleChapters = [
          { name: `Introduction to ${subject.name}`, orderIndex: 1 },
          { name: `${subject.name} Fundamentals`, orderIndex: 2 },
          { name: `Advanced ${subject.name}`, orderIndex: 3 }
        ];

        for (const chapterData of sampleChapters) {
          console.log(`    📝 Creating/updating chapter: ${chapterData.name}`);
          
          const existingChapter = await prisma.chapter.findFirst({
            where: {
              name: chapterData.name,
              subjectId: createdSubject.id
            }
          });

          let createdChapter;
          if (existingChapter) {
            // Update existing chapter
            createdChapter = await prisma.chapter.update({
              where: { id: existingChapter.id },
              data: {
                orderIndex: chapterData.orderIndex
              }
            });
            console.log(`      ✅ Updated existing chapter: ${chapterData.name}`);
          } else {
            // Create new chapter
            createdChapter = await prisma.chapter.create({
              data: {
                name: chapterData.name,
                orderIndex: chapterData.orderIndex,
                subjectId: createdSubject.id
              }
            });
            console.log(`      ✅ Created new chapter: ${chapterData.name}`);
          }

          // Create/update sample topics for each chapter
          const sampleTopics = [
            {
              name: `${chapterData.name} - Topic 1`,
              type: 'INTERACTIVE' as const,
              orderIndex: 1,
              description: `Interactive learning for ${chapterData.name}`,
              contentType: 'EXTERNAL_LINK' as const,
              url: 'https://www.baamboozle.com/game/sample'
            },
            {
              name: `${chapterData.name} - Topic 2`,
              type: 'VIDEO' as const,
              orderIndex: 2,
              description: `Video content for ${chapterData.name}`,
              contentType: 'VIDEO' as const,
              videoUrl: 'https://www.youtube.com/embed/sample'
            }
          ];

          for (const topicData of sampleTopics) {
            console.log(`      🎯 Creating/updating topic: ${topicData.name}`);
            
            const existingTopic = await prisma.topic.findFirst({
              where: {
                name: topicData.name,
                chapterId: createdChapter.id
              }
            });

            if (existingTopic) {
              // Update existing topic
              await prisma.topic.update({
                where: { id: existingTopic.id },
                data: {
                  type: topicData.type,
                  orderIndex: topicData.orderIndex,
                  description: topicData.description
                }
              });

              // Update topic content
              await prisma.topicContent.upsert({
                where: { topicId: existingTopic.id },
                update: {
                  contentType: topicData.contentType,
                  url: topicData.url,
                  videoUrl: topicData.videoUrl
                },
                create: {
                  topicId: existingTopic.id,
                  contentType: topicData.contentType,
                  url: topicData.url,
                  videoUrl: topicData.videoUrl
                }
              });
              console.log(`        ✅ Updated existing topic: ${topicData.name}`);
            } else {
              // Create new topic
              await prisma.topic.create({
                data: {
                  name: topicData.name,
                  type: topicData.type,
                  orderIndex: topicData.orderIndex,
                  description: topicData.description,
                  chapterId: createdChapter.id,
                  content: {
                    create: {
                      contentType: topicData.contentType,
                      url: topicData.url,
                      videoUrl: topicData.videoUrl
                    }
                  }
                }
              });
              console.log(`        ✅ Created new topic: ${topicData.name}`);
            }
          }
        }
      }
      console.log(`✅ ${classData.className} processed with ${classData.subjects.length} subjects`);
    }

    // Create sample content pages
    console.log('📋 Creating content pages...');
    await prisma.contentPage.createMany({
      data: [
        {
          title: 'Privacy Policy',
          slug: 'privacy-policy',
          pageType: 'PRIVACY_POLICY' as const,
          content: 'This is our privacy policy content...',
          isPublished: true
        },
        {
          title: 'Terms of Service',
          slug: 'terms-of-service',
          pageType: 'TERMS_OF_SERVICE' as const,
          content: 'These are our terms of service...',
          isPublished: true
        },
        {
          title: 'About Us',
          slug: 'about-us',
          pageType: 'ABOUT_US' as const,
          content: 'Learn more about ScioLabs...',
          isPublished: true
        }
      ],
      skipDuplicates: true
    });
    console.log('✅ Content pages created');

    console.log('\n🎉 Database seeding/updating completed successfully!');
    console.log('\n📊 Summary:');
    console.log('• Admin settings configured');
    console.log('• Sample school created/updated');
    console.log('• 5 classes created/updated (Class 4-8)');
    console.log('• 17 subjects created/updated with proper Tailwind gradient colors');
    console.log('• Sample chapters and topics for each subject created/updated');
    console.log('• Essential content pages created');
    console.log('\n🚀 Your application is now ready to use with updated data!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });