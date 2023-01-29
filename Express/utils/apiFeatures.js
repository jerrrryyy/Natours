class APIFeatures {
  constructor(query, queryString) {
    this.query = query; //like update,create,find
    this.queryString = queryString; //query req.query
  }

  filter() {
    //making a copy of req object
    //... is used for destructuring getting all the properties of the object
    //{} is used to make a copy of the object with destructered properties
    //after that we will exclude some properties which we use later for fitering
    const queryObj = { ...this.queryString };
    const excludeProp = ['sort', 'limit', 'fields', 'page'];
    //deleting a property from the req object
    excludeProp.forEach((el) => delete queryObj[el]);

    //if we add greater and less than to our requests using duration[gte]=5
    //we get our object as {duration:{gte:5}}
    //but for real filtering we need a query object as {duration:{$gte:5}}
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    //returning a full object
    return this;
  }

  //function for Sorting

  sorting() {
    if (this.queryString.sort) {
      //what if we want a another factor for sort
      //mongoDb function is sort('price ratingsAverage')

      //req.query.sort = -price,ratingsAverage
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createAt');
    }

    return this;
  }

  limiting() {
    //4.) Limiting the fields
    //?fields=name,duration,difficulty,price
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      //- is used for excluding a field
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    //5.) Pagination
    //req tours?page=2&limit=2
    const page = this.queryString.page * 1 || 1; // parsing the string and also giving 1 as default value
    const limit = this.queryString.limit * 1 || 12; //parsing the string and also giving 1 as default value
    const skip = (page - 1) * limit;
    //page is 2 and limit is 10 per page therfore we skip first 10 pages

    this.query = this.query.skip(skip).limit(limit);

    //   if (this.queryString.page) {
    //     const numTour = await Tour.countDocuments();
    //     if (skip >= numTour) throw new Error('Page not found');

    // }
    return this;
  }
}

module.exports = APIFeatures;
