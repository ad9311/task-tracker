# == Schema Information
#
# Table name: tasks
#
#  id          :integer          not null, primary key
#  description :string           not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
class Task < ApplicationRecord
end
