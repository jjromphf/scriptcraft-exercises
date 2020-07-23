var inventory = require('inventory');
var items = require('items');
var entities = require('entities');
var events = require('events');
var sounds = require('sounds');
var utils = require('utils');
var signs = require('signs');
var recipes = require('recipes');

exports.exercises = {
  wishLists: {
    build: { books: items.book(5) },
    quest: { /* all of your quest items */ },
    explore: { /* all of your explore items */ },
    generic: { /* all of your generic items */ }
  },
  helloWorld: function() {
    echo(self, 'it worked');
  },
  forLoop: function() {
    var d = new Drone(self);
    // drone is at our current location
    for (var i = 0; i < blocks.rainbow.length; i++) {
	     var currentBlock = blocks.rainbow[i];
	     // move forward one block every iteration and drop one block of the current color
	     d.fwd().box(currentBlock);
    }
  },
  whileLoop: function() {
    var d = new Drone(self);
    var i = 0;
    while(i < blocks.rainbow.length) {
	     // the same code as before
       var currentBlock = blocks.rainbow[i];
	     // move forward one block every iteration and drop one block of the current color
	     d.fwd().box(currentBlock); // an example of "method chaining"
       // with one important addition:
       i++;
    }
  },
  populateInventory: function() {
    var myInventory = inventory(self);
    var buildWishList = exercises.wishLists.build;
    for (var key in items) {
      myInventory.add(items[key](1));
    }
  },
  forEach: function() {
    var world = self.world;
    var Monster = Java.type('org.bukkit.entity.Monster');
    function blowUpEntity(entity) {
      world.createExplosion(entity.location, 10.0, true);
    }
    var zombies = world.getEntitiesByClass(Monster.class);
    zombies.forEach(blowUpEntity);
  },
  functionReturn: function(itemType) {
    var world = self.world;
    return function(nItems) {
      var itemStack = items[itemType](nItems);
      world.dropItem(self.location, itemStack);
    }
  },
  functionAnonymous: function() {
    return events.playerItemConsume(function(event) {
      if (event.getItem().getType() === items.bakedPotato()) {
        sounds.entityPlayerBurp();
      }
    });
  },
  interactiveSign: function(player) {
    var world = player.world;
    var location = player.location;
    var itemChoices = ['Shovel', 'Pickaxe', 'Hoe'];
    var itemValues = [ items.goldSpade(1), items.goldPickaxe(1), items.goldHoe(1) ];
    // signs.menu returns a function which can be called for one or more signs in the game.
    var convertToToolMenu = signs.menu('Tools',
      itemChoices,
      function(event) {
        world.dropItem(location, itemValues[event.number]);
    });

    var sign = signs.getTargetedBy(player);
    if (sign !== null) {
          convertToToolMenu(sign);
    }
  },
}

var RecipeMaker = function(name, material, ingredients, shape) {
  this.name = name;
  this.material = material;
  this.ingredients = ingredients;
  this.shape = shape;
  this.result = null;
  this.recipe = null;
}

RecipeMaker.ITEM_STACK_CLASS = Java.type('org.bukkit.inventory.ItemStack').class;
RecipeMaker.ENCHANTMENT_CLASS = Java.type('org.bukkit.enchantments.EnchantmentWrapper').class;

RecipeMaker.prototype.buildResult = function(enchantment, level) {
  if (this.material.class !== RecipeMaker.ITEM_STACK_CLASS) {
    throw new Error("Material must be of type " + RecipeMaker.ITEM_STACK_CLASS);
  }

  if (enchantment.class !== RecipeMaker.ENCHANTMENT_CLASS) {
    throw new Error("Enchantment must be of type " + RecipeMaker.ENCHANTMENT_CLASS);
  }
  // we're actually going to clone our material so we don't mess with it
  this.result = this.material.clone();
  // get the item's metadata
  var meta = this.result.getItemMeta();
  // set its display name to the provided name
  meta.setDisplayName(this.name);
  // replace the item's metadata with the new metadata
  this.result.setItemMeta(meta);
  this.result.addEnchantment(enchantment, level);
}

RecipeMaker.prototype.makeRecipe = function() {
  if (this.result === null) {
    throw new Error('Must call the buildResult method before you can make the recipe!');
  }
  this.recipe = {
    result: this.result,
    ingredients: this.ingredients, // an object with items
    shape: this.shape, // the shape represents the positions of the items in the rows on the workbench
  }
}

RecipeMaker.prototype.add = function() {
  return recipes.add(this.recipe);
}

RecipeMaker.prototype.remove = function() {
  recipes.remove(this.recipe);
}

exports.testRecipeMaker = function() {
  // emerald sword from https://www.spigotmc.org/wiki/recipe-example/
  var ingredients = {
    E: items.emerald(1),
    S: items.stick(1),
  }
  // two rows on the 2x2 craft bench
  var shape = ["EE", "SS", "  "];
  var rm = new RecipeMaker('Emerald Sword', items.diamondSword(1), ingredients, shape);
  var enchantment = Java.type('org.bukkit.enchantments.Enchantment').DAMAGE_ALL;
  rm.buildResult(enchantment, 5);
  rm.makeRecipe();
  var res = rm.add();
  if (res !== null) {
    echo(self, "RecipeMaker: Recipe Successfully Added!");
    inventory(self)
      .add(items.emerald(2))
      .add(items.stick(2));
  } else {
    echo(self, "RecipeMaker: Failed to Add Recipe!");
  }
}

exports.RecipeMaker = RecipeMaker;
