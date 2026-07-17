import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader2 } from "lucide-react";

import { useTaskEditForm } from "./-components/-useTaskEditForm";

import { BookmarksFieldGroup } from "@/components/bookmarks/BookmarksFieldGroup";
import {
  Button,
  EditPageFooter,
  EntityHeaderButton,
  PageContainer,
  PageHeader,
  UnsavedChangesDialog,
} from "@/components/editPage";

export const Route = createFileRoute("/tasks/$id/edit")({
  component: SingleTaskEdit,
});

function SingleTaskEdit() {
  const {
    id,
  } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();

  const {
    form,
    isSubmitting,
    handleDelete,
    taskTypeOptions,
    tagOptions,
    shouldBlock,
  } = useTaskEditForm(id, isNew);

  return (
    <div>
      <PageHeader
        pageTitle={isNew ? "New Task List" : "Edit Task List"}
        pageSection="tasks"
      >
        {!isNew && (
          <EntityHeaderButton
            to="/tasks/$id"
            params={{
              id,
            }}
            label="View Task List"
            icon={<EyeIcon />}
          />
        )}
      </PageHeader>
      <PageContainer>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex max-w-3xl flex-col gap-8"
        >
          <form.AppField name="name">
            {field => <field.InputField label="Task List Name" />}
          </form.AppField>

          <form.AppField name="dueDate">
            {field => (
              <field.DatePickerField
                label="Due Date"
                placeholder="No due date"
              />
            )}
          </form.AppField>

          <form.AppField name="taskTypeId">
            {field => (
              <field.ComboboxField
                label="Task Type"
                options={taskTypeOptions}
                placeholder="Search task types..."
              />
            )}
          </form.AppField>

          <form.AppField name="tagIds">
            {field => (
              <field.MultiComboboxField
                label="Tags"
                options={tagOptions}
                placeholder="Pick tags..."
                groupByPrefix
              />
            )}
          </form.AppField>

          <form.Field name="bookmarks">
            {field => (
              <BookmarksFieldGroup
                value={field.state.value}
                onChange={next => field.handleChange(next)}
              />
            )}
          </form.Field>

          <form.AppField name="description">
            {field => (
              <field.TextareaField
                label="Description"
                placeholder="What is this task about?"
              />
            )}
          </form.AppField>

          <EditPageFooter
            isNew={isNew}
            onDelete={handleDelete}
            deleteLabel="Delete Task List"
          >
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isNew ? "Create Task List" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (isNew) {
                  navigate({
                    to: "/tasks",
                  });
                }
                else {
                  navigate({
                    to: "/tasks/$id",
                    params: {
                      id,
                    },
                  });
                }
              }}
            >
              Cancel
            </Button>
          </EditPageFooter>
        </form>
        <UnsavedChangesDialog shouldBlockFn={shouldBlock} />
      </PageContainer>
    </div>
  );
}
