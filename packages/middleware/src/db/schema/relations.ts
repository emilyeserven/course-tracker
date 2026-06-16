// All relations() declarations live together in this module: relations are
// eager and cross-domain, so spreading them across the per-domain table files
// would create real ESM import cycles. Table files only reference each other
// through lazy FK callbacks, which is safe.
import { relations } from "drizzle-orm";

import { courseProviders, interactions, moduleGroups, modules, resources } from "./courses";
import { domains, domainWithinScopeTopics, radarBlips } from "./radar";
import { routineConnections, routines } from "./routines";
import { moduleGroupTags, moduleTags, resourceTags, tagGroups, tags, tasksToTags, topicsToTags } from "./tags";
import { taskResources, tasks, tasksToResources, taskTodos, taskTypes } from "./tasks";
import { topics, topicsToResources } from "./topics";

export const interactionsRelations = relations(interactions, ({
  one,
}) => ({
  resource: one(resources, {
    fields: [interactions.resourceId],
    references: [resources.id],
  }),
  moduleGroup: one(moduleGroups, {
    fields: [interactions.moduleGroupId],
    references: [moduleGroups.id],
  }),
  module: one(modules, {
    fields: [interactions.moduleId],
    references: [modules.id],
  }),
}));

export const tagGroupsRelations = relations(tagGroups, ({
  many,
}) => ({
  tags: many(tags),
}));

export const tagsRelations = relations(tags, ({
  one, many,
}) => ({
  group: one(tagGroups, {
    fields: [tags.groupId],
    references: [tagGroups.id],
  }),
  tasksToTags: many(tasksToTags),
  topicsToTags: many(topicsToTags),
  resourceTags: many(resourceTags),
  moduleGroupTags: many(moduleGroupTags),
  moduleTags: many(moduleTags),
}));

export const tasksToTagsRelations = relations(tasksToTags, ({
  one,
}) => ({
  task: one(tasks, {
    fields: [tasksToTags.taskId],
    references: [tasks.id],
  }),
  tag: one(tags, {
    fields: [tasksToTags.tagId],
    references: [tags.id],
  }),
}));

export const resourceTagsRelations = relations(resourceTags, ({
  one,
}) => ({
  resource: one(resources, {
    fields: [resourceTags.resourceId],
    references: [resources.id],
  }),
  tag: one(tags, {
    fields: [resourceTags.tagId],
    references: [tags.id],
  }),
}));

export const moduleGroupTagsRelations = relations(moduleGroupTags, ({
  one,
}) => ({
  moduleGroup: one(moduleGroups, {
    fields: [moduleGroupTags.moduleGroupId],
    references: [moduleGroups.id],
  }),
  tag: one(tags, {
    fields: [moduleGroupTags.tagId],
    references: [tags.id],
  }),
}));

export const moduleTagsRelations = relations(moduleTags, ({
  one,
}) => ({
  module: one(modules, {
    fields: [moduleTags.moduleId],
    references: [modules.id],
  }),
  tag: one(tags, {
    fields: [moduleTags.tagId],
    references: [tags.id],
  }),
}));

export const topicsToTagsRelations = relations(topicsToTags, ({
  one,
}) => ({
  topic: one(topics, {
    fields: [topicsToTags.topicId],
    references: [topics.id],
  }),
  tag: one(tags, {
    fields: [topicsToTags.tagId],
    references: [tags.id],
  }),
}));

export const tasksRelations = relations(tasks, ({
  one, many,
}) => ({
  topic: one(topics, {
    fields: [tasks.topicId],
    references: [topics.id],
  }),
  taskType: one(taskTypes, {
    fields: [tasks.taskTypeId],
    references: [taskTypes.id],
  }),
  tasksToTags: many(tasksToTags),
  tasksToResources: many(tasksToResources),
  resources: many(taskResources),
  todos: many(taskTodos),
}));

export const taskTypesRelations = relations(taskTypes, ({
  many,
}) => ({
  tasks: many(tasks),
}));

export const taskResourcesRelations = relations(taskResources, ({
  one,
}) => ({
  task: one(tasks, {
    fields: [taskResources.taskId],
    references: [tasks.id],
  }),
  resource: one(resources, {
    fields: [taskResources.resourceId],
    references: [resources.id],
  }),
  moduleGroup: one(moduleGroups, {
    fields: [taskResources.moduleGroupId],
    references: [moduleGroups.id],
  }),
  module: one(modules, {
    fields: [taskResources.moduleId],
    references: [modules.id],
  }),
}));

export const taskTodosRelations = relations(taskTodos, ({
  one,
}) => ({
  task: one(tasks, {
    fields: [taskTodos.taskId],
    references: [tasks.id],
  }),
  resource: one(resources, {
    fields: [taskTodos.resourceId],
    references: [resources.id],
  }),
  moduleGroup: one(moduleGroups, {
    fields: [taskTodos.moduleGroupId],
    references: [moduleGroups.id],
  }),
  module: one(modules, {
    fields: [taskTodos.moduleId],
    references: [modules.id],
  }),
}));

export const courseProviderRelations = relations(courseProviders, ({
  many,
}) => ({
  resources: many(resources),
}));

export const routinesRelations = relations(routines, ({
  many,
}) => ({
  connections: many(routineConnections),
}));

export const routineConnectionsRelations = relations(routineConnections, ({
  one,
}) => ({
  routine: one(routines, {
    fields: [routineConnections.routineId],
    references: [routines.id],
  }),
}));

export const resourcesRelations = relations(resources, ({
  one, many,
}) => ({
  courseProvider: one(courseProviders, {
    fields: [resources.courseProviderId],
    references: [courseProviders.id],
  }),
  topicsToResources: many(topicsToResources),
  tasksToResources: many(tasksToResources),
  moduleGroups: many(moduleGroups),
  modules: many(modules),
  interactions: many(interactions),
  resourceTags: many(resourceTags),
}));

export const moduleGroupsRelations = relations(moduleGroups, ({
  one, many,
}) => ({
  resource: one(resources, {
    fields: [moduleGroups.resourceId],
    references: [resources.id],
  }),
  modules: many(modules),
  interactions: many(interactions),
  moduleGroupTags: many(moduleGroupTags),
}));

export const modulesRelations = relations(modules, ({
  one, many,
}) => ({
  resource: one(resources, {
    fields: [modules.resourceId],
    references: [resources.id],
  }),
  moduleGroup: one(moduleGroups, {
    fields: [modules.moduleGroupId],
    references: [moduleGroups.id],
  }),
  interactions: many(interactions),
  moduleTags: many(moduleTags),
}));

export const topicsRelations = relations(topics, ({
  many,
}) => ({
  topicsToResources: many(topicsToResources),
  radarBlips: many(radarBlips),
  domainWithinScope: many(domainWithinScopeTopics),
  topicsToTags: many(topicsToTags),
  tasks: many(tasks),
}));

export const domainsRelations = relations(domains, ({
  many,
}) => ({
  radarBlips: many(radarBlips),
  withinScopeTopics: many(domainWithinScopeTopics),
}));

export const domainWithinScopeTopicsRelations = relations(
  domainWithinScopeTopics,
  ({
    one,
  }) => ({
    topic: one(topics, {
      fields: [domainWithinScopeTopics.topicId],
      references: [topics.id],
    }),
    domain: one(domains, {
      fields: [domainWithinScopeTopics.domainId],
      references: [domains.id],
    }),
  }),
);

export const topicsToResourcesRelation = relations(topicsToResources, ({
  one,
}) => ({
  topic: one(topics, {
    fields: [topicsToResources.topicId],
    references: [topics.id],
  }),
  resource: one(resources, {
    fields: [topicsToResources.resourceId],
    references: [resources.id],
  }),
  moduleGroup: one(moduleGroups, {
    fields: [topicsToResources.moduleGroupId],
    references: [moduleGroups.id],
  }),
  module: one(modules, {
    fields: [topicsToResources.moduleId],
    references: [modules.id],
  }),
}));

export const tasksToResourcesRelations = relations(tasksToResources, ({
  one,
}) => ({
  task: one(tasks, {
    fields: [tasksToResources.taskId],
    references: [tasks.id],
  }),
  resource: one(resources, {
    fields: [tasksToResources.resourceId],
    references: [resources.id],
  }),
  moduleGroup: one(moduleGroups, {
    fields: [tasksToResources.moduleGroupId],
    references: [moduleGroups.id],
  }),
  module: one(modules, {
    fields: [tasksToResources.moduleId],
    references: [modules.id],
  }),
}));

export const radarBlipsRelations = relations(radarBlips, ({
  one,
}) => ({
  domain: one(domains, {
    fields: [radarBlips.domainId],
    references: [domains.id],
  }),
  topic: one(topics, {
    fields: [radarBlips.topicId],
    references: [topics.id],
  }),
}));
