import fs from 'fs';
import axios from 'axios';
import RSS from 'rss';

import upload from './upload-to-aws.js';

const thirdPartyApiUrl = 'https://www.arcblock.io/blog/api/blogs?page=1&size=20';

(async () => {
  const tmpFile = 'arcblock-blog-feed.xml';
  try {
    console.log('Fetching blogs from arcblock.io...');
    const response = await axios.get(thirdPartyApiUrl);
    const blogs = response.data.data || [];

    // 创建新的RSS feed
    var feed = new RSS({
      title: 'ArcBlock Blog',
      description: 'Latest blogs from arcblock.io',
      feed_url:
        'https://link-general-public.s3.ap-northeast-3.amazonaws.com/arcblock-blog-feed.xml',
      site_url: 'https://www.arcblock.io/blog',
    });

    // 为每个博客条目添加到feed
    blogs.forEach((blog) => {
      feed.item({
        title: blog.title,
        description: blog.excerpt,
        url: `https://www.arcblock.io/blog/${blog.slug}`,
        date: blog.publishTime,
      });
    });

    const file = tmpFile;
    fs.writeFileSync(file, feed.xml(), 'utf8');
    console.log('Uploading file to AWS S3');
    await upload(file);
    console.log('Uploaded to AWS S3');
    fs.unlinkSync(file);
  } catch (error) {
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
    console.error('Failed to fetch blogs', error);
  }
})();
