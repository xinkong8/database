const Joi = require('joi');

// 创建验证中间件
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    
    if (error) {
      return res.status(400).json({
        error: '数据验证失败',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    next();
  };
};

// 用户注册验证规则
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.min': '用户名至少3个字符',
    'string.max': '用户名最多50个字符',
    'any.required': '用户名是必填项'
  }),
  email: Joi.string().email().required().messages({
    'string.email': '邮箱格式不正确',
    'any.required': '邮箱是必填项'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': '密码至少6个字符',
    'any.required': '密码是必填项'
  })
});

// 用户登录验证规则
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '邮箱格式不正确',
    'any.required': '邮箱是必填项'
  }),
  password: Joi.string().required().messages({
    'any.required': '密码是必填项'
  })
});

// 任务创建验证规则
const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.min': '任务标题不能为空',
    'string.max': '任务标题最多200个字符',
    'any.required': '任务标题是必填项'
  }),
  description: Joi.string().max(1000).allow('', null),
  categoryId: Joi.number().integer().positive().allow(null),
  projectId: Joi.number().integer().positive().allow(null),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  dueDate: Joi.date().iso().allow(null)
});

// 任务更新验证规则
const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().max(1000).allow('', null),
  categoryId: Joi.number().integer().positive().allow(null),
  projectId: Joi.number().integer().positive().allow(null),
  priority: Joi.string().valid('low', 'medium', 'high'),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled'),
  dueDate: Joi.date().iso().allow(null)
});

// 财务记录创建验证规则
const createFinanceRecordSchema = Joi.object({
  categoryId: Joi.number().integer().positive().required().messages({
    'any.required': '分类是必填项'
  }),
  type: Joi.string().valid('income', 'expense').required().messages({
    'any.required': '类型是必填项'
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': '金额必须大于0',
    'any.required': '金额是必填项'
  }),
  description: Joi.string().max(255).allow('', null),
  recordDate: Joi.date().iso().required().messages({
    'any.required': '记录日期是必填项'
  })
});

// 体重记录创建验证规则
const createWeightRecordSchema = Joi.object({
  weight: Joi.number().min(10).max(500).precision(2).required().messages({
    'number.min': '体重不能小于10kg',
    'number.max': '体重不能大于500kg',
    'any.required': '体重是必填项'
  }),
  bmi: Joi.number().min(10).max(50).precision(2).allow(null),
  recordDate: Joi.date().iso().required().messages({
    'any.required': '记录日期是必填项'
  }),
  notes: Joi.string().max(500).allow('', null)
});

// 任务分类创建验证规则
const createTaskCategorySchema = Joi.object({
  name: Joi.string().min(1).max(50).required().messages({
    'string.min': '分类名称不能为空',
    'string.max': '分类名称最多50个字符',
    'any.required': '分类名称是必填项'
  }),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow('', null).messages({
    'string.pattern.base': '颜色格式不正确，请使用十六进制格式'
  }),
  icon: Joi.string().max(50).allow('', null)
});

// 项目创建验证规则
const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': '项目名称不能为空',
    'string.max': '项目名称最多100个字符',
    'any.required': '项目名称是必填项'
  }),
  description: Joi.string().max(500).allow('', null),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow('', null).messages({
    'string.pattern.base': '颜色格式不正确，请使用十六进制格式'
  }),
  status: Joi.string().valid('active', 'inactive', 'completed', 'archived').default('active')
});

// 财务分类创建验证规则
const createFinanceCategorySchema = Joi.object({
  name: Joi.string().min(1).max(50).required().messages({
    'string.min': '分类名称不能为空',
    'string.max': '分类名称最多50个字符',
    'any.required': '分类名称是必填项'
  }),
  type: Joi.string().valid('income', 'expense').required().messages({
    'any.required': '分类类型是必填项'
  }),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow('', null).messages({
    'string.pattern.base': '颜色格式不正确，请使用十六进制格式'
  }),
  icon: Joi.string().max(50).allow('', null)
});

// 更新财务记录验证规则
const updateFinanceRecordSchema = Joi.object({
  categoryId: Joi.number().integer().positive(),
  type: Joi.string().valid('income', 'expense'),
  amount: Joi.number().positive().precision(2).messages({
    'number.positive': '金额必须大于0'
  }),
  description: Joi.string().max(255).allow('', null),
  recordDate: Joi.date().iso()
});

// 更新体重记录验证规则
const updateWeightRecordSchema = Joi.object({
  weight: Joi.number().min(10).max(500).precision(2).messages({
    'number.min': '体重不能小于10kg',
    'number.max': '体重不能大于500kg'
  }),
  bmi: Joi.number().min(10).max(50).precision(2).allow(null),
  recordDate: Joi.date().iso(),
  notes: Joi.string().max(500).allow('', null)
});

// BMI计算验证规则
const calculateBMISchema = Joi.object({
  weight: Joi.number().min(10).max(500).precision(2).required().messages({
    'number.min': '体重不能小于10kg',
    'number.max': '体重不能大于500kg',
    'any.required': '体重是必填项'
  }),
  height: Joi.number().min(50).max(300).precision(1).required().messages({
    'number.min': '身高不能小于50cm',
    'number.max': '身高不能大于300cm',
    'any.required': '身高是必填项'
  })
});

// 修改密码验证规则
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': '当前密码是必填项'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': '新密码至少6个字符',
    'any.required': '新密码是必填项'
  })
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createTaskSchema,
  updateTaskSchema,
  createTaskCategorySchema,
  createProjectSchema,
  createFinanceRecordSchema,
  updateFinanceRecordSchema,
  createFinanceCategorySchema,
  createWeightRecordSchema,
  updateWeightRecordSchema,
  calculateBMISchema,
  changePasswordSchema
}; 