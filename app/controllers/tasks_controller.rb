class TasksController < ApplicationController
  before_action :delay

  def index
    tasks = Task.order(created_at: :desc)

    render json: tasks
  end

  def create
    task = Task.new(task_params)
    if task.valid?
      task.save
      render json: task
    else
      render json: { error: task.errors.full_messages }, status: 400
    end
  end

  private

  def set_task
    @task = Task.find(params[:id])
  end

  def task_params
    params.require(:task).permit(:description)
  end

  def delay
    sleep 1 if Rails.env.development? # Brief pause to show loading state on the backend.
  end
end
