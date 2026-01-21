interface ISiteMetadataResult {
  siteTitle: string;
  siteUrl: string;
  description: string;
  logo: string;
  navLinks: {
    name: string;
    url: string;
  }[];
}

const getBasePath = () => {
  const baseUrl = import.meta.env.BASE_URL;
  return baseUrl === '/' ? '' : baseUrl;
};

const data: ISiteMetadataResult = {
  siteTitle: 'RUN.LOG',
  siteUrl: `${getBasePath()}/`,
  logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTtc69JxHNcmN1ETpMUX4dozAgAN6iPjWalQ&usqp=CAU',
  description: 'Personal running page',
  navLinks: [
    {
      name: '首页',
      url: `${getBasePath()}/`,
    },
    {
      name: '轨迹墙',
      url: `${getBasePath()}/summary`,
    },
    {
      name: '热力图',
      url: `${getBasePath()}/heatmap`,
    },
  ],
};

export default data;
