import React from 'react'
import ContentLoader from 'react-content-loader'

const PizzasSkeleton = (props) => (
  <ContentLoader
    className='content__items'
    speed={2}
    width={280}
    height={465}
    viewBox='0 0 280 465'
    backgroundColor='#f3f3f3'
    foregroundColor='#ecebeb'
    {...props}
    >
      <circle cx='140' cy='130' r='130'/>

      <rect x='0' y='275' rx='10' ry='10' width='280' height='24'/>
      <rect x='0' y='315' rx='10' ry='10' width='280' height='85'/>
      <rect x='0' y='425' rx='10' ry='10' width='90' height='27'/>
      <rect x='125' y='415' rx='20' ry='20' width='150' height='45'/>
  </ContentLoader>
)

export default PizzasSkeleton
