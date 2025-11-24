require 'test_helper'

class TasksControllerTest < ActionDispatch::IntegrationTest
  class TasksControllerIndex < TasksControllerTest
    test 'should get the task list' do
      get tasks_url
      json = JSON.parse(response.body)

      assert_equal Task.count, json.size
      assert_response :success
    end

    test 'should get all tasks ordered' do
      get tasks_url
      json = JSON.parse(response.body)

      tasks = Task.order(created_at: :desc).pluck(:id)
      assert_equal tasks, json.pluck("id")
      assert_response :success
    end
  end

  class TasksControllerCreate < TasksControllerTest
    test 'should create new task' do
      description = 'Create Test'

      assert_difference("Task.count", 1) do
        post tasks_url, params: { task: { description: } }

        assert_equal description, Task.find_by(description:).description
        assert_response :success
      end
    end

    test 'should respond error' do
      post tasks_url, params: { task: { description: "" } }
      json = JSON.parse(response.body)

      assert_equal ["Description can't be blank"], json["error"]
      assert_response :bad_request
    end
  end
end
