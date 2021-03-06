import range from 'lodash/range';
import max from 'lodash/max';
import min from 'lodash/min';

class ValidationService {
  validateCookbook(data) {
    // Start page must be less than end page
    const start = parseInt(data.cookbook.start_page, 10);
    const end = parseInt(data.cookbook.end_page, 10);

    if (start > end) {
      return false;
    }

    return true;
  }

  validateEditCookbook(data, cookbook) {
    // Start page must be less than end page
    const start = parseInt(data.cookbook.start_page, 10);
    const end = parseInt(data.cookbook.end_page, 10);
    const recipes = cookbook.recipes;
    const recipePages = this.getRecipePages(recipes);
    const maxPage = max(recipePages);
    const minPage = min(recipePages)

    if (start > end) {
      return [false, 'Start page cannot preceed end page.'];
    } else if (start > minPage) {
      return [false, 'Your new start page preceeds an existing recipe.'];
    } else if (end < maxPage) {
      return [false, 'Your new end page is less an existing recipe.'];
    }

    return [true, 'Valid cookbook.'];
  }

  getRecipePages(recipes) {
    const pages = [];
    for (let i = 0; i < recipes.length; i++) {
      pages.push(recipes[i].start_page);
      pages.push(recipes[i].end_page);
    }
    return pages;
  }

  validateRecipe(data, availPages, action, cookbook, ogPages) {
    const start = parseInt(data.recipe.start_page, 10);
    const end = parseInt(data.recipe.end_page, 10);
    let isNotValidRange = false;

    switch (action) {
      case 'new':
        isNotValidRange = this.checkIsNotValidRangeNew(start, end, availPages);
        break;
      case 'edit':
        isNotValidRange = this.checkIsNotValidRangeEdit(start, end, availPages, ogPages);
        break;
      default:
        throw new Error(`${action} is not a valid action for validateRecipe().`)
    }

    if (start > end) {
      return [false, 'The start page cannot preceed the end page. Try again.'];
    } else if (start < cookbook.start_page) {
      return [false, 'The recipe start page cannot preceed the cookbook start page. Try again.'];
    } else if (end > cookbook.end_page) {
      return [false, 'The recipe end page cannot exceed the cookbook end page.'];
    } else if (isNotValidRange) {
      return [false, 'Some or all of this recipe\'s pages belong to another recipe. Try again.'];
    }

    return [true, 'Valid Recipe'];
  }

  checkIsNotValidRangeNew(start, end, availPages) {
    const recipeRange = range(start, end + 1);
    const entireRangeValid = recipeRange.every((e) => availPages.indexOf(e) !== -1);

    if (start === end && availPages.indexOf(start) > -1) {
      return false;
    } else if (entireRangeValid) {
      return false;
    }
    return true;
  }

  // Push original start & end back in. Not start and end from edit. Bad Logic here.
  checkIsNotValidRangeEdit(start, end, availPages, ogPages) {
    // Get original start and end pages
    const ogStart = parseInt(ogPages.start_page, 10);
    const ogEnd = parseInt(ogPages.end_page, 10);
    // Mage a range from OG pages and push it into availPages
    let ogRange = [];
    ogStart === ogEnd ? ogRange.push(ogStart) : ogRange = range(ogStart, ogEnd + 1);
    availPages = availPages.concat(ogRange).sort();

    const recipeRange = range(start, end + 1);
    const entireRangeValid = recipeRange.every((e) => availPages.indexOf(e) !== -1);

    if (entireRangeValid) {
      return false;
    }
    return true;
  }
}

export default ValidationService;
