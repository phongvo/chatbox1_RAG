class BaseService {
  constructor(model) {
    this.model = model;
  }

  // Common CRUD operations
  async findAll(filter = {}, options = {}) {
    try {
      const { limit, skip, sort, select } = options;
      let query = this.model.find(filter);
      
      if (select) query = query.select(select);
      if (sort) query = query.sort(sort);
      if (skip) query = query.skip(skip);
      if (limit) query = query.limit(limit);
      
      return await query.exec();
    } catch (error) {
      throw new Error(`Error finding records: ${error.message}`);
    }
  }

  async findById(id, select = null) {
    try {
      let query = this.model.findById(id);
      if (select) query = query.select(select);
      return await query.exec();
    } catch (error) {
      throw new Error(`Error finding record by ID: ${error.message}`);
    }
  }

  async findOne(filter, select = null) {
    try {
      let query = this.model.findOne(filter);
      if (select) query = query.select(select);
      return await query.exec();
    } catch (error) {
      throw new Error(`Error finding record: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const record = new this.model(data);
      return await record.save();
    } catch (error) {
      throw new Error(`Error creating record: ${error.message}`);
    }
  }

  async updateById(id, data, options = { new: true, runValidators: true }) {
    try {
      return await this.model.findByIdAndUpdate(id, data, options);
    } catch (error) {
      throw new Error(`Error updating record: ${error.message}`);
    }
  }

  async deleteById(id) {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting record: ${error.message}`);
    }
  }

  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      throw new Error(`Error counting records: ${error.message}`);
    }
  }

  // Soft delete (for models with isActive field)
  async softDelete(id) {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error soft deleting record: ${error.message}`);
    }
  }
}

module.exports = BaseService;