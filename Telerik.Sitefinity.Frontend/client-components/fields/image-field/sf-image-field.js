﻿(function ($) {
    var sfFields = angular.module('sfFields');
    sfFields.requires.push('sfImageField');

    angular.module('sfImageField', ['sfServices', 'sfImageSelector'])
        .directive('sfImageField', ['serverContext', 'sfMediaService', 'sfMediaFilter', function (serverContext, sfMediaService, sfMediaFilter) {
            return {
                restrict: "AE",
                scope: {
                    sfModel: '=',
                    sfImage: '=?',
                    sfProvider: '=?'
                },
                templateUrl: function (elem, attrs) {
                    var assembly = attrs.sfTemplateAssembly || 'Telerik.Sitefinity.Frontend';
                    var url = attrs.sfTemplateUrl || 'client-components/fields/image-field/sf-image-field.html';
                    return serverContext.getEmbeddedResourceUrl(assembly, url);
                },
                link: function (scope, element, attrs, ctrl) {
                    var getDateFromString = function (dateStr) {
                        return (new Date(parseInt(dateStr.substring(dateStr.indexOf('Date(') + 'Date('.length, dateStr.indexOf(')'))))).toGMTString();
                    };

                    var getImage = function (id) {
                        sfMediaService.images.getById(id, scope.model.provider).then(function (data) {
                            if (data && data.Item) {
                                refreshScopeInfo(data.Item);
                            }
                        });
                    };

                    var refreshScopeInfo = function (item) {
                        scope.sfImage = item;

                        scope.imageSize = Math.ceil(item.TotalSize / 1000) + " KB";
                        scope.uploaded = getDateFromString(item.DateCreated);
                    };

                    scope.model = {
                        selectedItems: [],
                        filterObject: null,
                        provider: scope.sfProvider
                    };

                    scope.editAllProperties = function () {
                    };

                    scope.done = function () {
                        scope.$modalInstance.close();

                        if (scope.model.selectedItems && scope.model.selectedItems.length) {
                            scope.sfProvider = scope.model.provider;

                            if (scope.model.selectedItems[0].Id && scope.model.selectedItems[0].ThumbnailUrl) {
                                // image is passed -> set it to model
                                refreshScopeInfo(scope.model.selectedItems[0]);
                            }
                            else {
                                // Id is passed -> get image
                                getImage(scope.model.selectedItems[0]);
                            }
                        }
                    };

                    scope.cancel = function () {
                        // cancels the image properties if no image is selected
                        if (scope.sfModel === undefined) {
                            scope.sfModel = null;
                        }

                        scope.$modalInstance.dismiss();
                    };

                    scope.changeImage = function () {
                        if (scope.sfImage) {
                            scope.model.filterObject = sfMediaFilter.newFilter();
                            scope.model.filterObject.set.parent.to(scope.sfImage.FolderId || scope.sfImage.ParentId || scope.sfImage.Album.Id);
                        }

                        scope.$openModalDialog();
                    };

                    // Initialize
                    if (scope.sfModel) {
                        getImage(scope.sfModel);
                    }
                    else {
                        scope.changeImage();
                    }

                    scope.$on('sf-image-selector-image-uploaded', function (event, uploadedImageInfo) {
                        getImage(uploadedImageInfo.ContentId);
                        scope.$modalInstance.dismiss();
                    });

                    scope.$watch('sfImage.Id', function (newVal) {
                        scope.sfModel = newVal;
                    });
                }
            };
        }]);
})(jQuery);
