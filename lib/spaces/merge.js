function buildIdentity(item) {
  return [item.type, item.source, item.externalId].join("::");
}

function pickValue(currentValue, incomingValue) {
  if (currentValue !== null && currentValue !== undefined && currentValue !== "") return currentValue;
  if (incomingValue !== null && incomingValue !== undefined && incomingValue !== "") return incomingValue;
  return null;
}

function mergeContributors(current = [], incoming = []) {
  return [...new Set([...current, ...incoming])];
}

export function mergeSpaceItems({ sourceItems, targetItems }) {
  const toCreate = [];
  const toUpdate = [];
  const targetMap = new Map(targetItems.map((item) => [buildIdentity(item), item]));

  for (const sourceItem of sourceItems) {
    const identity = buildIdentity(sourceItem);
    const existing = targetMap.get(identity);
    const incomingContributors = sourceItem.contributors || [sourceItem.addedById].filter(Boolean);

    if (!existing) {
      toCreate.push({
        type: sourceItem.type,
        source: sourceItem.source,
        externalId: sourceItem.externalId,
        title: sourceItem.title,
        posterImage: sourceItem.posterImage || null,
        notes: sourceItem.notes || null,
        status: "wishlist",
        addedById: sourceItem.addedById,
        contributors: mergeContributors([], incomingContributors)
      });
      continue;
    }

    const currentContributors = existing.contributors || [existing.addedById].filter(Boolean);
    toUpdate.push({
      id: existing.id,
      status: "wishlist",
      title: pickValue(existing.title, sourceItem.title),
      posterImage: pickValue(existing.posterImage, sourceItem.posterImage),
      notes: pickValue(existing.notes, sourceItem.notes),
      contributors: mergeContributors(currentContributors, incomingContributors)
    });
  }

  return { toCreate, toUpdate };
}

export async function mergeSpaceIntoTarget({ prisma, sourceSpaceId, targetSpaceId }) {
  if (sourceSpaceId === targetSpaceId) {
    return { created: 0, merged: 0 };
  }

  const [sourceItems, targetItems] = await Promise.all([
    prisma.item.findMany({
      where: { spaceId: sourceSpaceId },
      include: { contributors: { select: { userId: true } } }
    }),
    prisma.item.findMany({
      where: { spaceId: targetSpaceId },
      include: { contributors: { select: { userId: true } } }
    })
  ]);

  const normalize = (item) => ({
    ...item,
    contributors: (item.contributors || []).map((contributor) => contributor.userId)
  });
  const plan = mergeSpaceItems({
    sourceItems: sourceItems.map(normalize),
    targetItems: targetItems.map(normalize)
  });

  for (const createInput of plan.toCreate) {
    const contributors = createInput.contributors?.length ? createInput.contributors : [createInput.addedById];
    const item = await prisma.item.create({
      data: {
        spaceId: targetSpaceId,
        type: createInput.type,
        source: createInput.source,
        externalId: createInput.externalId,
        title: createInput.title,
        posterImage: createInput.posterImage || null,
        notes: createInput.notes || null,
        status: "wishlist",
        addedById: createInput.addedById,
        contributors: {
          create: contributors.map((userId) => ({ userId }))
        }
      }
    });
    void item;
  }

  for (const updateInput of plan.toUpdate) {
    await prisma.item.update({
      where: { id: updateInput.id },
      data: {
        status: "wishlist",
        title: updateInput.title,
        posterImage: updateInput.posterImage,
        notes: updateInput.notes
      }
    });

    for (const userId of updateInput.contributors) {
      await prisma.itemContributor.upsert({
        where: { itemId_userId: { itemId: updateInput.id, userId } },
        update: {},
        create: { itemId: updateInput.id, userId }
      });
    }
  }

  return { created: plan.toCreate.length, merged: plan.toUpdate.length };
}
